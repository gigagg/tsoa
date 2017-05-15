import { Metadata } from '../metadataGeneration/metadataGenerator';
import { RoutesConfig } from './../config';
export declare class RouteGenerator {
    private readonly metadata;
    private readonly options;
    constructor(metadata: Metadata, options: RoutesConfig);
    GenerateRoutes(middlewareTemplate: string, pathTransformer: (path: string) => string): Promise<void>;
    GenerateExpressRoutes(): Promise<void>;
    GenerateHapiRoutes(): Promise<void>;
    GenerateKoaRoutes(): Promise<void>;
    private buildContent(middlewareTemplate, pathTransformer);
    private getModels();
    private getRelativeImportPath(fileLocation);
    private getPropertySchema(source);
    private getParameterSchema(parameter);
}
export interface ArraySchema {
    typeName: string;
    enumMembers?: string[] | number[];
}
export interface ParameterSchema {
    name: string;
    in: string;
    typeName: string;
    required: boolean;
    array?: ArraySchema;
    request?: boolean;
    enumMembers?: string[] | number[];
}
