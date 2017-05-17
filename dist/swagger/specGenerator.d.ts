import { SwaggerConfig } from './../config';
import { Metadata } from '../metadataGeneration/metadataGenerator';
import { Swagger } from './swagger';
export declare class SpecGenerator {
    private readonly metadata;
    private readonly config;
    constructor(metadata: Metadata, config: SwaggerConfig);
    GenerateJson(swaggerDir: string): void;
    GetSpec(): Swagger.Spec;
    private buildDefinitions();
    private buildPaths();
    private buildPathMethod(controllerName, method, pathObject);
    private buildBodyPropParameter(controllerName, method);
    private buildParameter(parameter);
    private buildProperties(properties);
    private buildAdditionalProperties(properties);
    private buildOperation(controllerName, method);
    private getOperationId(controllerName, methodName);
    private getSwaggerType(type);
    private getSwaggerTypeForPrimitiveType(type);
    private getSwaggerTypeForArrayType(arrayType);
    private getSwaggerTypeForEnumType(enumType);
    private getSwaggerTypeForReferenceType(referenceType);
}
