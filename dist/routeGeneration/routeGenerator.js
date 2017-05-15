"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("./templates/express");
var hapi_1 = require("./templates/hapi");
var koa_1 = require("./templates/koa");
var fs = require("fs");
var handlebars = require("handlebars");
var path = require("path");
var tsfmt = require("typescript-formatter");
var RouteGenerator = (function () {
    function RouteGenerator(metadata, options) {
        this.metadata = metadata;
        this.options = options;
    }
    RouteGenerator.prototype.GenerateRoutes = function (middlewareTemplate, pathTransformer) {
        var fileName = this.options.routesDir + "/routes.ts";
        var content = this.buildContent(middlewareTemplate, pathTransformer);
        return new Promise(function (resolve, reject) {
            tsfmt.processString(fileName, content, {
                editorconfig: true,
                replace: true,
                tsconfig: true,
                tsfmt: true,
                tslint: true,
                verify: true,
                vscode: true
            })
                .then(function (result) {
                fs.writeFile(fileName, result.dest, function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    };
    RouteGenerator.prototype.GenerateExpressRoutes = function () {
        return this.GenerateRoutes(express_1.expressTemplate, function (path) { return path.replace(/{/g, ':').replace(/}/g, ''); });
    };
    RouteGenerator.prototype.GenerateHapiRoutes = function () {
        return this.GenerateRoutes(hapi_1.hapiTemplate, function (path) { return path; });
    };
    RouteGenerator.prototype.GenerateKoaRoutes = function () {
        return this.GenerateRoutes(koa_1.koaTemplate, function (path) { return path.replace(/{/g, ':').replace(/}/g, ''); });
    };
    RouteGenerator.prototype.buildContent = function (middlewareTemplate, pathTransformer) {
        var _this = this;
        var canImportByAlias;
        try {
            require('tsoa');
            canImportByAlias = true;
        }
        catch (err) {
            canImportByAlias = false;
        }
        handlebars.registerHelper('json', function (context) {
            return JSON.stringify(context);
        });
        var routesTemplate = handlebars.compile(("/* tslint:disable */\n            import {ValidateParam} from '" + (canImportByAlias ? 'tsoa' : '../../../src/routeGeneration/templateHelpers') + "';\n            import { Controller } from '" + (canImportByAlias ? 'tsoa' : '../../../src/interfaces/controller') + "';\n            {{#if iocModule}}\n            import { iocContainer } from '{{iocModule}}';\n            {{/if}}\n            {{#each controllers}}\n            import { {{name}} } from '{{modulePath}}';\n            {{/each}}\n\n            const models: any = {\n                {{#each models}}\n                \"{{name}}\": {\n                    {{#each properties}}\n                        \"{{@key}}\": {{{json this}}},\n                    {{/each}}\n                },\n                {{/each}}\n            };\n        ").concat(middlewareTemplate), { noEscape: true });
        var authenticationModule = this.options.authenticationModule ? this.getRelativeImportPath(this.options.authenticationModule) : undefined;
        var iocModule = this.options.iocModule ? this.getRelativeImportPath(this.options.iocModule) : undefined;
        return routesTemplate({
            authenticationModule: authenticationModule,
            basePath: this.options.basePath === '/' ? '' : this.options.basePath,
            controllers: this.metadata.Controllers.map(function (controller) {
                return {
                    actions: controller.methods.map(function (method) {
                        var parameters = {};
                        method.parameters.forEach(function (parameter) {
                            parameters[parameter.parameterName] = _this.getParameterSchema(parameter);
                        });
                        return {
                            method: method.method.toLowerCase(),
                            name: method.name,
                            parameters: parameters,
                            path: pathTransformer(method.path),
                            security: method.security
                        };
                    }),
                    modulePath: _this.getRelativeImportPath(controller.location),
                    name: controller.name,
                    path: controller.path
                };
            }),
            iocModule: iocModule,
            models: this.getModels(),
            useSecurity: this.metadata.Controllers.some(function (controller) { return controller.methods.some(function (methods) { return methods.security !== undefined; }); })
        });
    };
    RouteGenerator.prototype.getModels = function () {
        var _this = this;
        return Object.keys(this.metadata.ReferenceTypes).map(function (key) {
            var referenceType = _this.metadata.ReferenceTypes[key];
            var properties = {};
            referenceType.properties.map(function (property) {
                properties[property.name] = _this.getPropertySchema(property);
            });
            return {
                name: key,
                properties: properties
            };
        });
    };
    RouteGenerator.prototype.getRelativeImportPath = function (fileLocation) {
        fileLocation = fileLocation.replace('.ts', '');
        return "./" + path.relative(this.options.routesDir, fileLocation).replace(/\\/g, '/');
    };
    RouteGenerator.prototype.getPropertySchema = function (source) {
        var templateProperty = {
            required: source.required,
            typeName: source.type.typeName
        };
        var arrayType = source.type;
        if (arrayType.elementType) {
            var arraySchema = {
                typeName: arrayType.elementType.typeName
            };
            var arrayEnumType = arrayType.elementType;
            if (arrayEnumType.enumMembers) {
                arraySchema.enumMembers = arrayEnumType.enumMembers;
            }
            templateProperty.array = arraySchema;
        }
        var enumType = source.type;
        if (enumType.enumMembers) {
            templateProperty.enumMembers = enumType.enumMembers;
        }
        return templateProperty;
    };
    RouteGenerator.prototype.getParameterSchema = function (parameter) {
        var parameterSchema = {
            in: parameter.in,
            name: parameter.name,
            required: parameter.required,
            typeName: parameter.type.typeName
        };
        var arrayType = parameter.type;
        if (arrayType.elementType) {
            var tempArrayType = {
                typeName: arrayType.elementType.typeName
            };
            var arrayEnumType = arrayType.elementType;
            if (arrayEnumType.enumMembers) {
                tempArrayType.enumMembers = arrayEnumType.enumMembers;
            }
            parameterSchema.array = tempArrayType;
        }
        var enumType = parameter.type;
        if (enumType.enumMembers) {
            parameterSchema.enumMembers = enumType.enumMembers;
        }
        return parameterSchema;
    };
    return RouteGenerator;
}());
exports.RouteGenerator = RouteGenerator;
//# sourceMappingURL=routeGenerator.js.map