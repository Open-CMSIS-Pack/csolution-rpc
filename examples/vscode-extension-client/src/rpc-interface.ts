/*
 * Copyright (c) 2025 Arm Limited. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 * json-rpc-codegen generated file: DO NOT EDIT!
 */

export interface Common {
    id: string,
    description?: string,
    doc?: string,
}
export interface Pack extends Common {
    overview?: string,
    used?: boolean,
    references?: string[],
}
export interface PacksInfo {
    packs: Pack[],
}
export interface Component extends Common {
    pack: string,
    implements?: string,
    maxInstances?: number,
}
export interface CtItem {
    name: string,
}
export interface ComponentInstance {
    id: string,
    selectedCount: number,
    resolvedComponent?: Component,
    layer?: string,
}
export interface CtVariant extends CtItem {
    components: Component[],
}
export interface CtAggregate extends CtItem {
    id: string,
    activeVariant?: string,
    activeVersion?: string,
    selectedCount?: number,
    variants: CtVariant[],
    layer?: string,
}
export interface CtTreeItem extends CtItem {
    cgroups?: CtGroup[],
    aggregates?: CtAggregate[],
}
export type Api = Common;
export type Taxonomy = Common;
export interface CtGroup extends CtTreeItem {
    api?: Api,
    taxonomy?: Taxonomy,
}
export type Bundle = Common;
export interface CtBundle extends CtTreeItem {
    bundle?: Bundle,
}
export interface CtClass extends CtItem {
    taxonomy?: Taxonomy,
    activeBundle?: string,
    bundles: CtBundle[],
}
export interface CtRoot {
    classes: CtClass[],
}
export interface Condition {
    expression: string,
    aggregates?: string[],
}
export interface Result {
    result: string,
    id: string,
    aggregates?: string[],
    conditions?: Condition[],
}
export interface Results {
    validation?: Result[],
}
export interface UsedItems {
    components: ComponentInstance[],
    packs: Pack[],
}
export interface LogMessages {
    info?: string[],
    errors?: string[],
    warnings?: string[],
}
export interface ApplyParams {
    context: string,
}
export interface LoadSolutionParams {
    solution: string,
}
export interface GetPacksInfoParams {
    context: string,
}
export interface GetUsedItemsParams {
    context: string,
}
export interface GetComponentsTreeParams {
    context: string,
    all: boolean,
}
export interface SelectComponentParams {
    context: string,
    id: string,
    count: number,
}
export interface SelectVariantParams {
    context: string,
    id: string,
    variant: string,
}
export interface SelectVersionParams {
    context: string,
    id: string,
    version: string,
}
export interface SelectBundleParams {
    context: string,
    cclass: string,
    bundle: string,
}
export interface ValidateComponentsParams {
    context: string,
}

export interface RpcInterface {
  getVersion(): Promise<string>;
  shutdown(): Promise<boolean>;
  apply(args: ApplyParams): Promise<boolean>;
  loadPacks(): Promise<boolean>;
  loadSolution(args: LoadSolutionParams): Promise<boolean>;
  getPacksInfo(args: GetPacksInfoParams): Promise<PacksInfo>;
  getUsedItems(args: GetUsedItemsParams): Promise<UsedItems>;
  getComponentsTree(args: GetComponentsTreeParams): Promise<CtRoot>;
  selectComponent(args: SelectComponentParams): Promise<boolean>;
  selectVariant(args: SelectVariantParams): Promise<boolean>;
  selectVersion(args: SelectVersionParams): Promise<boolean>;
  selectBundle(args: SelectBundleParams): Promise<boolean>;
  validateComponents(args: ValidateComponentsParams): Promise<Results>;
  getLogMessages(): Promise<LogMessages>;
}

export abstract class RpcMethods implements RpcInterface {

    abstract get<TArgs, TResponse>(remoteMethod: string, args?: TArgs): Promise<TResponse>;

    public async getVersion(): Promise<string> {
        return this.get('GetVersion');
    }
    public async shutdown(): Promise<boolean> {
        return this.get('Shutdown');
    }
    public async apply(args: ApplyParams): Promise<boolean> {
        return this.get('Apply', args);
    }
    public async loadPacks(): Promise<boolean> {
        return this.get('LoadPacks');
    }
    public async loadSolution(args: LoadSolutionParams): Promise<boolean> {
        return this.get('LoadSolution', args);
    }
    public async getPacksInfo(args: GetPacksInfoParams): Promise<PacksInfo> {
        return this.get('GetPacksInfo', args);
    }
    public async getUsedItems(args: GetUsedItemsParams): Promise<UsedItems> {
        return this.get('GetUsedItems', args);
    }
    public async getComponentsTree(args: GetComponentsTreeParams): Promise<CtRoot> {
        return this.get('GetComponentsTree', args);
    }
    public async selectComponent(args: SelectComponentParams): Promise<boolean> {
        return this.get('SelectComponent', args);
    }
    public async selectVariant(args: SelectVariantParams): Promise<boolean> {
        return this.get('SelectVariant', args);
    }
    public async selectVersion(args: SelectVersionParams): Promise<boolean> {
        return this.get('SelectVersion', args);
    }
    public async selectBundle(args: SelectBundleParams): Promise<boolean> {
        return this.get('SelectBundle', args);
    }
    public async validateComponents(args: ValidateComponentsParams): Promise<Results> {
        return this.get('ValidateComponents', args);
    }
    public async getLogMessages(): Promise<LogMessages> {
        return this.get('GetLogMessages');
    }
}
