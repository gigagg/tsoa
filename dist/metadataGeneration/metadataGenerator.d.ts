import * as ts from 'typescript';
export declare class MetadataGenerator {
    static current: MetadataGenerator;
    readonly nodes: ts.Node[];
    readonly typeChecker: ts.TypeChecker;
    private readonly program;
    private referenceTypes;
    private circularDependencyResolvers;
    IsExportedNode(node: ts.Node): boolean;
    constructor(entryFile: string);
    Generate(): Metadata;
    TypeChecker(): ts.TypeChecker;
    AddReferenceType(referenceType: ReferenceType): void;
    GetReferenceType(typeName: string): ReferenceType;
    OnFinish(callback: (referenceTypes: {
        [typeName: string]: ReferenceType;
    }) => void): void;
    private buildControllers();
}
export interface Metadata {
    Controllers: Controller[];
    ReferenceTypes: {
        [typeName: string]: ReferenceType;
    };
}
export interface Controller {
    location: string;
    methods: Method[];
    name: string;
    path: string;
}
export interface Method {
    deprecated?: boolean;
    description: string;
    method: string;
    name: string;
    parameters: Parameter[];
    path: string;
    type: Type;
    tags: string[];
    responses: ResponseType[];
    security?: Security;
    summary?: string;
}
export interface Parameter {
    parameterName: string;
    description: string;
    in: string;
    name: string;
    required: boolean;
    default?: string | boolean | number | Object;
    enum?: number[] | string[];
    type: Type;
}
export interface Security {
    name: string;
    scopes?: string[];
}
export interface Type {
    typeName: string;
}
export interface EnumerateType extends Type {
    enumMembers: number[] | string[];
    enumNames?: string[];
}
export interface ReferenceType extends Type {
    description: string;
    properties: Property[];
}
export interface ArrayType extends Type {
    elementType: Type;
}
export interface ResponseType {
    description: string;
    name: string;
    schema?: Type;
    examples?: any;
}
export interface Property {
    description: string;
    name: string;
    type: Type;
    required: boolean;
}
