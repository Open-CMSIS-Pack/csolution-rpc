import { Command } from "commander";
import fs from 'fs';
import path from "path";
import yaml from 'yaml';

const program = new Command();

program
  .name("codegen")
  .description("json-rpc interface code generator")
  .version("0.0.9")
  .argument('<schema>', 'openapi.yml schema')
  .option("-c, --client <string>", "Generate TypeScript client interface", "./rpc-interface.ts")
  .option("-s, --server <string>", "Generate C++ server interface", "./RpcInterface.h")
  .action((filepath, options) => {
    console.log(`Generating intefaces for ${filepath}`);
    const codegen = new Codegen();
    const methods = codegen.parseSchema(filepath);
    codegen.collectInfo(methods);
    const ts = codegen.genTs();
    const cpp = codegen.genCpp();

    codegen.createServer(options, cpp);
    codegen.createClient(options, ts);
  });

export interface Method {
  params?: object;
  result?: object;
  ref?: object;
  description?: string; // TODO: populate with /rpc/<method> description
}

export interface Member {
  name: string;
  cppType: string;
  tsType: string;
  description?: string;
  optional?: boolean;
}

export interface Struct {
  description?: string;
  members?: Member[];
  extends?: string[];
}

export interface Function {
  description?: string;
  cppFunction?: string;
  cppRegistration?: string;
  tsFunction?: string;
  tsImplementation?: string;
}

export class Codegen {

  public structs: Record<string, Struct> = {};
  public functions: Record<string, Function> = {};

  readonly header =
`/*
 * Copyright (c) 2025 Arm Limited. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 * json-rpc-codegen generated file: DO NOT EDIT!
 */\n`;

  readonly cppHeader =
`#ifndef RPCINTERFACE_H
#define RPCINTERFACE_H\n
#include <jsonrpccxx/server.hpp>
#include <optional>
#include <string>
#include <vector>\n
using namespace std;
using namespace jsonrpccxx;\n`;

  readonly cppFooter = '#endif // RPCINTERFACE_H';

  readonly cppToJsonTemplates =
`  template<class T> void to_json(nlohmann::json& j, const string& key, const T& value) {
    j[key] = value;
  }
  template<class T> void to_json(nlohmann::json& j, const string& key, const optional<T>& opt) {
    if (opt.has_value()) {
      j[key] = opt.value();
    }
  }\n`;

  public run(argv: string[]) {
    program.parse(argv);
  }

  public createClient(options: {client: string}, content: string) {
    fs.mkdirSync(path.dirname(options.client), { recursive: true });
    fs.writeFileSync(options.client, content);
  }

  public createServer(options: {server: string}, content: string) {
    fs.mkdirSync(path.dirname(options.server), { recursive: true });
    fs.writeFileSync(options.server, content);
  }

  public parseSchema(filepath: string) : Record<string, Method> {
    let doc: any;
    try {
      doc = yaml.parse(fs.readFileSync(filepath, 'utf8'));
    } catch (e) {
      console.error("error reading file:", e);
      return {};
    }

    const methods: Record<string, Method> = {};

    if (doc) {
      const entries = doc.components?.schemas;

      for (const [name, schema] of Object.entries(entries)) {
        const request = name.match(/^(.*)Request/);
        const response = name.match(/^(.*)Response/);
        const methodName = request ? request[1] : response ? response[1] : name;
        if (!methods[methodName]) {
          methods[methodName] = {};
        }
        if ((request || response) && Array.isArray((schema as any).allOf)) {
          for (const item of (schema as any).allOf) {
            if (item.properties) {
              if (item.properties.params) {
                methods[methodName].params = item.properties.params;
              } else if (item.properties.result) {
                methods[methodName].result = item.properties.result;
              }
            }
          }
        } else {
          methods[methodName].ref = (schema as any);
        }
      }
    }
    return methods;
  }

  public getTypeName(name: string, suffix: string = 'Type') : string {
    return name.charAt(0).toUpperCase() + name.slice(1) + suffix;
  }

  private kebabToCamel(str: string): string {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  private pascalToCamel(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  private quoteIfDashed(str: string): string {
    return str.includes('-') ? `'${str}'` : str;
  }

  public getType(name: string, item: any, suffix?: string, prefix?: string) : { cpp: string, ts: string } {
    let cppType = '';
    let tsType = '';
    if (item.$ref) {
        const ref = item.$ref.match(/^#\/components\/schemas\/(.*)/);
        tsType = ref ? ref[1] : '';
        cppType = `${prefix ?? ''}${tsType}`;
    } else {
        switch (item.type) {
          case 'array': {
            const {cpp, ts} = this.getType(name, item.items, suffix);
            tsType = `${ts}[]`;
            cppType = `vector<${prefix ?? ''}${cpp}>`;
            break;
          }
          case 'boolean':
            tsType = 'boolean';
            cppType = 'bool';
            break;
          case 'integer':
          case 'number':
            tsType = 'number';
            cppType = 'int';
            break;
          case 'string':
            tsType = 'string';
            cppType = 'string';
            break;
          default:
            console.warn('missing schema type for:', name);
            // eslint-disable-next-line no-fallthrough
          case 'object':
            if (item.properties) {
              tsType = this.getTypeName(name, suffix);
              cppType = `${prefix ?? ''}${tsType}`;
            } else {
              console.error('unknown type:', item.type);
            }
        }
    }
    return { cpp: cppType, ts: tsType };
  }

  public collectStruct(name: string, obj: any) {
    if (obj.properties) {
      this.structs[name] ??= { description: obj.description };
      for (const [element, item] of Object.entries(obj.properties)) {
        const {cpp, ts} = this.getType(element, item);
        (this.structs[name].members ??= []).push({
          name: element,
          cppType: cpp,
          tsType: ts,
          description: (item as any).description,
          optional: obj.required ? !(obj.required as any).includes(element) : true,
        });
      }
    }
  }

  public collectStructs(parent: string, obj: any) {
    const properties = obj.properties ? obj.properties :
      (obj.items && obj.items.properties) ? obj.items.properties : null;
    if (properties) {
      for (const [name, item] of Object.entries(properties)) {
        this.collectStructs(this.getTypeName(name), item);
      }
      this.collectStruct(parent, obj.items ?? obj);
    }
    if (obj.allOf && Array.isArray(obj.allOf)) {
      for (const item of obj.allOf) {
        if (item.properties) {
          this.collectStructs(parent, item);
        } else if (item.$ref) {
          const ref = item.$ref.match(/^#\/components\/schemas\/(.*)/);
          this.structs[parent] ??= { description: obj.description };
          (this.structs[parent].extends ??= []).push(ref ? ref[1] : '');
        }
      }
    }
  }

  public collectFunction(name: string, params: any, result: any, description?: string) {
    const cppResult = this.getType(name, result, 'Result', 'RpcArgs::').cpp;
    let cppFunction = `virtual ${cppResult} ${name}(`;
    let cppRegistration = `jsonServer.Add("${name}", GetHandle(&RpcMethods::${name}, *this)`;

    const tsResultType = result ? this.getType(name, result, 'Result').ts : undefined;
    const tsParamsType = params ? this.getType(name, params, 'Params').ts : undefined;

    const tsFunction = `${this.pascalToCamel(name)}(${tsParamsType ? `args: ${tsParamsType}` : ``}): Promise<${tsResultType}>`;
    const tsImplementation = `this.get('${name}'${tsParamsType ? `, args` : ``})`;

    if (params && params.properties) {
      const cppParams: string[] = [];
      const cppRegParams: string[] = [];
      for (const [param, item] of Object.entries(params.properties)) {
        cppParams.push(`const ${this.getType(name, item).cpp}& ${param}`);
        cppRegParams.push(`"${param}"`);
      }
      cppFunction += cppParams.join(", ");
      cppRegistration += `, { ${cppRegParams.join(', ')} }`;
    } else {
      cppFunction += 'void';
    }
    cppFunction += `) { return ${cppResult}(); }`;
    cppRegistration += `);`;

    this.functions[name] = {
      description: description,
      cppFunction: cppFunction,
      cppRegistration: cppRegistration,
      tsFunction: tsFunction,
      tsImplementation: tsImplementation,
    };
  }

  public collectInfo(methods: Record<string, Method>) {
    for (const [name, method] of Object.entries(methods)) {
      if (method.ref) {
        this.collectStructs(name, method.ref);
      }
      if (method.result) {
        this.collectStructs(this.getTypeName(name, 'Result'), method.result);
      }
      if (method.params) {
        this.collectStructs(this.getTypeName(name, 'Params'), method.params);
      }
      if (method.params || method.result) {
        this.collectFunction(name, method.params, method.result, method.description);
      }
    }
  }

  public genCppClass() : string {
    let content = `class RpcMethods {\npublic:\n  RpcMethods(JsonRpc2Server& jsonServer) {\n`;
    for (const name in this.functions) {
      content += `    ${this.functions[name].cppRegistration}\n`;
    }
    content += `  }\n`;
    for (const name in this.functions) {
      content += `  ${this.functions[name].cppFunction}\n`
    }
    content += `};\n`;
    return content;
  }

  public genCppNamespace() : string {
    let content = `namespace RpcArgs {\n`;

    // cpp structs
    const declaredStructs: string[] = [];
    for (const name in this.structs) {
      const struct = this.structs[name];
      declaredStructs.push(name);
      let structContent = '';
      const forwardDeclaration = new Set<string>;
      //TODO: content += `${struct.description ? `  // ${struct.description}\n` : ''}`;
      if (struct.members) {
        structContent += `  struct ${name}`;
        if (struct.extends) {
          const baseClasses = (struct.extends.map(s => `public ${s}`)).join(', ');
          structContent += ` : ${baseClasses}`;
        }
        structContent +=` {\n`;
        for (const element of struct.members) {
          // need forward declarations
          const s = element.cppType.match(/(?:vector<)?(\w+)>?/);
          if (s && s[1] in this.structs && !declaredStructs.includes(s[1])) {
            forwardDeclaration.add(s[1]);
          }
          const cppStruct = `${element.optional ? `optional<${element.cppType}>` :
            `${element.cppType}`} ${this.kebabToCamel(element.name)};`;
            structContent += `    ${cppStruct}\n`;
          //TODO: content += `${element.description ? ` // ${element.description}` : ``}\n`;
        }
        structContent += `  };\n`;
      } else {
        if (struct.extends) {
          const baseClasses = struct.extends.join(', ');
          structContent += `  using ${name} = ${baseClasses};\n`;
        }
      }
      for (const s of forwardDeclaration) {
        content += `  struct ${s};\n`
      }
      content += structContent;
    }

    // cpp to json
    content += `\n${this.cppToJsonTemplates}`;
    for (const name in this.structs) {
      const struct = this.structs[name];
      if (struct.members) {
        content += `  inline void to_json(nlohmann::json& j, const ${name}& s) {\n`;
        for (const element of struct.members) {
          const cppToJson = `to_json(j, "${element.name}", s.${this.kebabToCamel(element.name)});`;
          content += `    ${cppToJson}\n`;
        }
        content += `  }\n`;
      }
    }

    content += `}\n`
    return content;
  }

  public genCpp() {
    const content = `${this.header}\n${this.cppHeader}\n${this.genCppNamespace()}\n${this.genCppClass()}\n${this.cppFooter}\n`;
    return content;
  }

  public genTsTypeInterfaces() : string {
    let content = '';
    for (const name in this.structs) {
      const struct = this.structs[name];
      if (struct.members) {
        content += `export interface ${name}`;
        if (struct.extends) {
          const baseClasses = struct.extends.join(', ');
          content += ` extends ${baseClasses}`;
        }
        content += ` {\n`;
        for (const element of struct.members) {
          const tsInterface = `${this.quoteIfDashed(element.name)}${element.optional ? '?' : ''}: ${element.tsType},`;
          content += `    ${tsInterface}\n`;
        }
        content += `}\n`;
      } else {
        if (struct.extends) {
          const baseClasses = struct.extends.join(', ');
          content += `export type ${name} = ${baseClasses};\n`;
        }
      }
    }
    return content;
  }

  public genTsInterface() : string {
    let content = `export interface RpcInterface {\n`;
    for (const name in this.functions) {
      content += `  ${this.functions[name].tsFunction};\n`;
    }
    content += `}\n`;
    return content;
  }

  public genTsClass() : string {
    let content = 'export abstract class RpcMethods implements RpcInterface {\n\n';
    content += '    abstract get<TArgs, TResponse>(remoteMethod: string, args?: TArgs): Promise<TResponse>;\n\n';
    for (const name in this.functions) {
      content += `    public async ${this.functions[name].tsFunction} {\n        return ${this.functions[name].tsImplementation};\n    }\n`;
    }
    content += `}\n`;
    return content;
  }

  public genTs() {
    const content = `${this.header}\n${this.genTsTypeInterfaces()}\n${this.genTsInterface()}\n${this.genTsClass()}`;
    return content;
  }
}
