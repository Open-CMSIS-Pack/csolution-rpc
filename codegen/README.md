# json-rpc-codegen

A TypeScript-based Node.js tool designed to generate strongly-typed, language-agnostic RPC interfaces for client-server communication between a TypeScript frontend and a C++ backend. It adheres to the [JSON RPC 2.0](https://www.jsonrpc.org/specification) protocol to define method contracts and data structures.

The tool produces:

`rpc-interface.ts`: Declares TypeScript interfaces for client-side consumption, enabling typed RPC calls.

`RpcInterface.h`: Generates corresponding C++ headers with abstract classes, typed structs, and method registration to facilitate server-side implementation.

This tool ensures consistent, type-safe communication across platforms, streamlines integration, and reduces boilerplate by synchronizing RPC definitions in both languages.

Name and schema conventions are described in the [API Specification](../api/README.md#name-and-schema-conventions).
Extending interfaces/classes/structs is translated using class inheritance. The order they appear in the schema is preserved and reflected in the generated code. Forward declarations are generated whenever they are needed.

### Install node modules

```
npm install
```

### Build
```
npm run build
```

### Lint
```
npm run lint
```

### Test
```
npm test
```

### Run
```
node dist/cli.js
```

# Command line options
```
Usage: codegen [options] <schema>

json-rpc interface code generator

Arguments:
  schema                 openapi.yml schema

Options:
  -V, --version          output the version number
  -c, --client <string>  Generate TypeScript client interface
  -s, --server <string>  Generate C++ server interface
  -h, --help             display help for command
  ```
