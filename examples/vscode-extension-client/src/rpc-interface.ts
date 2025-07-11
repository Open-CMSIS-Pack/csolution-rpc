/*
 * Copyright (c) 2025 Arm Limited. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 * json-rpc-codegen generated file: DO NOT EDIT!
 */

export interface SuccessResult {
    success: boolean,
    message?: string,
}
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
export interface PacksInfo extends SuccessResult {
    packs: Pack[],
}
export interface Component extends Common {
    pack: string,
    implements?: string,
    maxInstances?: number,
}
export interface Options {
    layer?: string,
    explicitVersion?: string,
    explicitVendor?: boolean,
}
export interface ComponentInstance {
    id: string,
    selectedCount: number,
    generator?: string,
    fixed?: boolean,
    options?: Options,
    resolvedComponent?: Component,
}
export interface CtItem {
    name: string,
    result?: string,
}
export interface CtVariant extends CtItem {
    components: Component[],
}
export interface CtAggregate extends CtItem {
    id: string,
    activeVariant?: string,
    activeVersion?: string,
    selectedCount?: number,
    generator?: string,
    fixed?: boolean,
    variants: CtVariant[],
    options?: Options,
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
export interface CtRoot extends SuccessResult {
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
export interface Results extends SuccessResult {
    result: string,
    validation?: Result[],
}
export interface UsedItems extends SuccessResult {
    components: ComponentInstance[],
    packs: Pack[],
}
export interface LogMessages extends SuccessResult {
    info?: string[],
    errors?: string[],
    warnings?: string[],
}
export interface GetVersionResult extends SuccessResult {
    version?: string,
}
export interface ApplyParams {
    context: string,
}
export interface ResolveParams {
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
    options: Options,
}
export interface SelectVariantParams {
    context: string,
    id: string,
    variant: string,
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
  getVersion(): Promise<GetVersionResult>;
  shutdown(): Promise<SuccessResult>;
  apply(args: ApplyParams): Promise<SuccessResult>;
  resolve(args: ResolveParams): Promise<SuccessResult>;
  loadPacks(): Promise<SuccessResult>;
  loadSolution(args: LoadSolutionParams): Promise<SuccessResult>;
  getPacksInfo(args: GetPacksInfoParams): Promise<PacksInfo>;
  getUsedItems(args: GetUsedItemsParams): Promise<UsedItems>;
  getComponentsTree(args: GetComponentsTreeParams): Promise<CtRoot>;
  selectComponent(args: SelectComponentParams): Promise<SuccessResult>;
  selectVariant(args: SelectVariantParams): Promise<SuccessResult>;
  selectBundle(args: SelectBundleParams): Promise<SuccessResult>;
  validateComponents(args: ValidateComponentsParams): Promise<Results>;
  getLogMessages(): Promise<LogMessages>;
}

export abstract class RpcMethods implements RpcInterface {

    abstract get<TArgs, TResponse>(remoteMethod: string, args?: TArgs): Promise<TResponse>;

    public async getVersion(): Promise<GetVersionResult> {
        return this.get('GetVersion');
    }
    public async shutdown(): Promise<SuccessResult> {
        return this.get('Shutdown');
    }
    public async apply(args: ApplyParams): Promise<SuccessResult> {
        return this.get('Apply', args);
    }
    public async resolve(args: ResolveParams): Promise<SuccessResult> {
        return this.get('Resolve', args);
    }
    public async loadPacks(): Promise<SuccessResult> {
        return this.get('LoadPacks');
    }
    public async loadSolution(args: LoadSolutionParams): Promise<SuccessResult> {
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
    public async selectComponent(args: SelectComponentParams): Promise<SuccessResult> {
        return this.get('SelectComponent', args);
    }
    public async selectVariant(args: SelectVariantParams): Promise<SuccessResult> {
        return this.get('SelectVariant', args);
    }
    public async selectBundle(args: SelectBundleParams): Promise<SuccessResult> {
        return this.get('SelectBundle', args);
    }
    public async validateComponents(args: ValidateComponentsParams): Promise<Results> {
        return this.get('ValidateComponents', args);
    }
    public async getLogMessages(): Promise<LogMessages> {
        return this.get('GetLogMessages');
    }
}
