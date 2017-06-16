import * as ts from 'typescript';
import { Type } from './types';
export declare function ResolveType(typeNode: ts.TypeNode): Type;
export declare function getModelTypeDeclaration(type: ts.EntityName): ts.InterfaceDeclaration | ts.TypeAliasDeclaration | ts.ClassDeclaration;
