"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var mkdirp = require("mkdirp");
var SpecGenerator = (function () {
    function SpecGenerator(metadata, config) {
        this.metadata = metadata;
        this.config = config;
    }
    SpecGenerator.prototype.GenerateJson = function (swaggerDir) {
        var _this = this;
        mkdirp(swaggerDir, function (dirErr) {
            if (dirErr) {
                throw dirErr;
            }
            fs.writeFile(swaggerDir + "/swagger.json", JSON.stringify(_this.GetSpec(), null, '\t'), function (err) {
                if (err) {
                    throw new Error(err.toString());
                }
                ;
            });
        });
    };
    SpecGenerator.prototype.GetSpec = function () {
        var spec = {
            basePath: this.config.basePath,
            consumes: ['application/json'],
            definitions: this.buildDefinitions(),
            info: {},
            paths: this.buildPaths(),
            produces: ['application/json'],
            swagger: '2.0'
        };
        spec.securityDefinitions = this.config.securityDefinitions
            ? this.config.securityDefinitions
            : {};
        if (this.config.description) {
            spec.info.description = this.config.description;
        }
        if (this.config.license) {
            spec.info.license = { name: this.config.license };
        }
        if (this.config.name) {
            spec.info.title = this.config.name;
        }
        if (this.config.version) {
            spec.info.version = this.config.version;
        }
        if (this.config.host) {
            spec.host = this.config.host;
        }
        if (this.config.spec) {
            this.config.specMerging = this.config.specMerging || 'immediate';
            var mergeFuncs = {
                immediate: Object.assign,
                recursive: require('merge').recursive,
            };
            spec = mergeFuncs[this.config.specMerging](spec, this.config.spec);
        }
        return spec;
    };
    SpecGenerator.prototype.buildDefinitions = function () {
        var _this = this;
        var definitions = {};
        Object.keys(this.metadata.ReferenceTypes).map(function (typeName) {
            var referenceType = _this.metadata.ReferenceTypes[typeName];
            definitions[referenceType.typeName] = {
                description: referenceType.description,
                properties: _this.buildProperties(referenceType.properties),
                required: referenceType.properties.filter(function (p) { return p.required; }).map(function (p) { return p.name; }),
                type: 'object'
            };
        });
        return definitions;
    };
    SpecGenerator.prototype.buildPaths = function () {
        var _this = this;
        var paths = {};
        this.metadata.Controllers.forEach(function (controller) {
            controller.methods.forEach(function (method) {
                var path = "" + (controller.path ? "/" + controller.path : '') + method.path;
                paths[path] = paths[path] || {};
                _this.buildPathMethod(controller.name, method, paths[path]);
            });
        });
        return paths;
    };
    SpecGenerator.prototype.buildPathMethod = function (controllerName, method, pathObject) {
        var _this = this;
        var pathMethod = pathObject[method.method] = this.buildOperation(controllerName, method);
        pathMethod.description = method.description;
        if (method.deprecated) {
            pathMethod.deprecated = method.deprecated;
        }
        if (method.tags.length) {
            pathMethod.tags = method.tags;
        }
        if (method.security) {
            var security = {};
            security[method.security.name] = method.security.scopes ? method.security.scopes : [];
            pathMethod.security = [security];
        }
        pathMethod.parameters = method.parameters
            .filter(function (p) {
            return !(p.in === 'request' || p.in === 'body-prop');
        })
            .map(function (p) { return _this.buildParameter(p); });
        var bodyPropParameter = this.buildBodyPropParameter(method);
        if (bodyPropParameter) {
            pathMethod.parameters.push(bodyPropParameter);
        }
        if (pathMethod.parameters.filter(function (p) { return p.in === 'body'; }).length > 1) {
            throw new Error('Only one body parameter allowed per controller method.');
        }
    };
    SpecGenerator.prototype.buildBodyPropParameter = function (method) {
        var _this = this;
        var properties = {};
        var required = [];
        method.parameters
            .filter(function (p) { return p.in === 'body-prop'; })
            .forEach(function (p) {
            properties[p.name] = _this.getSwaggerType(p.type);
            properties[p.name].description = p.description;
            if (p.required) {
                required.push(p.name);
            }
        });
        if (!Object.keys(properties).length) {
            return;
        }
        ;
        var parameter = {
            in: 'body',
            name: 'body',
            schema: {
                properties: properties,
                title: 'inline-schema',
                type: 'object'
            }
        };
        if (required.length) {
            parameter.schema.required = required;
        }
        return parameter;
    };
    SpecGenerator.prototype.buildParameter = function (parameter) {
        var swaggerParameter = {
            default: parameter.default,
            description: parameter.description,
            enum: parameter.enum,
            in: parameter.in,
            name: parameter.name,
            required: parameter.required,
        };
        var parameterType = this.getSwaggerType(parameter.type);
        if (parameterType.$ref) {
            swaggerParameter.schema = parameterType;
        }
        else {
            swaggerParameter.type = parameterType.type;
        }
        if (parameterType.format) {
            swaggerParameter.format = parameterType.format;
        }
        return swaggerParameter;
    };
    SpecGenerator.prototype.buildProperties = function (properties) {
        var _this = this;
        var swaggerProperties = {};
        properties.forEach(function (property) {
            var swaggerType = _this.getSwaggerType(property.type);
            if (!swaggerType.$ref) {
                swaggerType.description = property.description;
            }
            swaggerProperties[property.name] = swaggerType;
        });
        return swaggerProperties;
    };
    SpecGenerator.prototype.buildOperation = function (controllerName, method) {
        var _this = this;
        var responses = {};
        method.responses.forEach(function (res) {
            responses[res.name] = {
                description: res.description
            };
            if (res.schema && _this.getSwaggerType(res.schema).type !== 'void') {
                responses[res.name]['schema'] = _this.getSwaggerType(res.schema);
            }
            if (res.examples) {
                responses[res.name]['examples'] = { 'application/json': res.examples };
            }
        });
        return {
            operationId: controllerName + "-" + method.name,
            produces: ['application/json'],
            responses: responses
        };
    };
    SpecGenerator.prototype.getSwaggerType = function (type) {
        var swaggerType = this.getSwaggerTypeForPrimitiveType(type);
        if (swaggerType) {
            return swaggerType;
        }
        var arrayType = type;
        if (arrayType.elementType) {
            return this.getSwaggerTypeForArrayType(arrayType);
        }
        var enumType = type;
        if (enumType.enumMembers) {
            return this.getSwaggerTypeForEnumType(enumType);
        }
        var refType = this.getSwaggerTypeForReferenceType(type);
        return refType;
    };
    SpecGenerator.prototype.getSwaggerTypeForPrimitiveType = function (type) {
        var typeMap = {
            binary: { type: 'string', format: 'binary' },
            boolean: { type: 'boolean' },
            buffer: { type: 'string', format: 'base64' },
            byte: { type: 'string', format: 'byte' },
            date: { type: 'string', format: 'date' },
            datetime: { type: 'string', format: 'date-time' },
            double: { type: 'number', format: 'double' },
            float: { type: 'number', format: 'float' },
            integer: { type: 'integer', format: 'int32' },
            long: { type: 'integer', format: 'int64' },
            object: { type: 'object' },
            string: { type: 'string' },
            void: { type: 'void' }
        };
        return typeMap[type.typeName];
    };
    SpecGenerator.prototype.getSwaggerTypeForArrayType = function (arrayType) {
        return { type: 'array', items: this.getSwaggerType(arrayType.elementType) };
    };
    SpecGenerator.prototype.getSwaggerTypeForEnumType = function (enumType) {
        if (enumType.enumMembers.length > 0 && typeof enumType.enumMembers[0] === 'number') {
            return { type: 'number', enum: enumType.enumMembers };
        }
        return { type: 'string', enum: enumType.enumMembers };
    };
    SpecGenerator.prototype.getSwaggerTypeForReferenceType = function (referenceType) {
        return { $ref: "#/definitions/" + referenceType.typeName };
    };
    return SpecGenerator;
}());
exports.SpecGenerator = SpecGenerator;
//# sourceMappingURL=specGenerator.js.map