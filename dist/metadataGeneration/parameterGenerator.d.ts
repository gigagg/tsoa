import { Parameter } from './metadataGenerator';
import * as ts from 'typescript';
export declare class ParameterGenerator {
    private readonly parameter;
    private readonly method;
    private readonly path;
    constructor(parameter: ts.ParameterDeclaration, method: string, path: string);
    Generate(): Parameter;
    private getCurrentLocation();
    private getDefaultValue(initializer);
    private getRequestParameter(parameter);
    private getBodyPropParameter(parameter);
    private getBodyParameter(parameter);
    private getHeaderParameter(parameter);
    private getQueryParameter(parameter);
    private getPathParameter(parameter);
    private getDetailParameter(parameter);
    private getParameterDescription(node);
    private supportsBodyParameters(method);
    private supportParameterDecorator(decoratorName);
    private supportPathDataType(parameterType);
    private getValidatedType(parameter);
    private getEnumValues(parameter);
}
