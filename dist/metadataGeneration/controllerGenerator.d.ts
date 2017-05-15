import * as ts from 'typescript';
import { Controller } from './metadataGenerator';
export declare class ControllerGenerator {
    private readonly node;
    private readonly pathValue;
    constructor(node: ts.ClassDeclaration);
    IsValid(): boolean;
    Generate(): Controller;
    private buildMethods();
    private getControllerRouteValue(node);
    private getControllerDecoratorValue(node, decoratorName, defaultValue);
}
