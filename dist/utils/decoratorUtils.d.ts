import * as ts from 'typescript';
export declare function getDecorators(node: ts.Node, isMatching: (identifier: ts.Identifier) => boolean): ts.Identifier[] | undefined;
export declare function getDecoratorName(node: ts.Node, isMatching: (identifier: ts.Identifier) => boolean): string | undefined;
export declare function getDecoratorTextValue(node: ts.Node, isMatching: (identifier: ts.Identifier) => boolean): string | undefined;
export declare function isDecorator(node: ts.Node, isMatching: (identifier: ts.Identifier) => boolean): boolean;
