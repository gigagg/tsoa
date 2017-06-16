"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expressionParser_1 = require("./expressionParser");
var _ = require("lodash");
var ts = require("typescript");
var metadataGenerator_1 = require("./metadataGenerator");
var resolveType_1 = require("./resolveType");
var exceptions_1 = require("./exceptions");
var decoratorUtils_1 = require("./../utils/decoratorUtils");
var validatorUtils_1 = require("./../utils/validatorUtils");
var ParameterGenerator = (function () {
    function ParameterGenerator(parameter, method, path) {
        this.parameter = parameter;
        this.method = method;
        this.path = path;
    }
    ParameterGenerator.prototype.Generate = function () {
        var _this = this;
        var decoratorName = decoratorUtils_1.getDecoratorName(this.parameter, function (identifier) { return _this.supportParameterDecorator(identifier.text); });
        switch (decoratorName) {
            case 'Request':
                return this.getRequestParameter(this.parameter);
            case 'Body':
                return this.getBodyParameter(this.parameter);
            case 'BodyProp':
                return this.getBodyPropParameter(this.parameter);
            case 'Header':
                return this.getHeaderParameter(this.parameter);
            case 'Query':
                return this.getQueryParameter(this.parameter);
            case 'Path':
                return this.getPathParameter(this.parameter);
            default:
                return this.getPathParameter(this.parameter);
        }
    };
    ParameterGenerator.prototype.getCurrentLocation = function () {
        var methodId = this.parameter.parent.name;
        var controllerId = this.parameter.parent.parent.name;
        return controllerId.text + "." + methodId.text;
    };
    ParameterGenerator.prototype.getDefaultValue = function (initializer) {
        try {
            if (initializer) {
                return expressionParser_1.parseExpression(initializer);
            }
        }
        catch (e) {
            // Ignore errors (default value cannot be parsed) Maybe I should add a log
        }
        return;
    };
    ParameterGenerator.prototype.getRequestParameter = function (parameter) {
        var parameterName = parameter.name.text;
        return {
            default: this.getDefaultValue(parameter.initializer),
            description: this.getParameterDescription(parameter),
            in: 'request',
            name: parameterName,
            required: !parameter.questionToken && !parameter.initializer,
            type: { typeName: 'object' },
            parameterName: parameterName,
            validators: validatorUtils_1.getParameterValidators(this.parameter, parameterName),
        };
    };
    ParameterGenerator.prototype.getBodyPropParameter = function (parameter) {
        var parameterName = parameter.name.text;
        var type = this.getValidatedType(parameter);
        if (!this.supportBodyMethod(this.method)) {
            throw new exceptions_1.GenerateMetadataError(parameter, "Body can't support '" + this.getCurrentLocation() + "' method.");
        }
        return {
            default: this.getDefaultValue(parameter.initializer),
            description: this.getParameterDescription(parameter),
            in: 'body-prop',
            name: decoratorUtils_1.getDecoratorTextValue(this.parameter, function (ident) { return ident.text === 'BodyProp'; }) || parameterName,
            required: !parameter.questionToken && !parameter.initializer,
            type: type,
            parameterName: parameterName,
            validators: validatorUtils_1.getParameterValidators(this.parameter, parameterName),
        };
    };
    ParameterGenerator.prototype.getBodyParameter = function (parameter) {
        var parameterName = parameter.name.text;
        var type = this.getValidatedType(parameter);
        if (!this.supportBodyMethod(this.method)) {
            throw new exceptions_1.GenerateMetadataError(parameter, "Body can't support " + this.method + " method");
        }
        return {
            default: this.getDefaultValue(parameter.initializer),
            description: this.getParameterDescription(parameter),
            in: 'body',
            name: parameterName,
            required: !parameter.questionToken && !parameter.initializer,
            type: type,
            parameterName: parameterName,
            validators: validatorUtils_1.getParameterValidators(this.parameter, parameterName),
        };
    };
    ParameterGenerator.prototype.getHeaderParameter = function (parameter) {
        var parameterName = parameter.name.text;
        var type = this.getValidatedType(parameter);
        if (!this.supportPathDataType(type)) {
            throw new exceptions_1.GenerateMetadataError(parameter, "Parameter '" + parameterName + "' can't be passed as a header parameter in '" + this.getCurrentLocation() + "'.");
        }
        return {
            default: this.getDefaultValue(parameter.initializer),
            description: this.getParameterDescription(parameter),
            in: 'header',
            name: decoratorUtils_1.getDecoratorTextValue(this.parameter, function (ident) { return ident.text === 'Header'; }) || parameterName,
            required: !parameter.questionToken && !parameter.initializer,
            type: type,
            parameterName: parameterName,
            validators: validatorUtils_1.getParameterValidators(this.parameter, parameterName),
        };
    };
    ParameterGenerator.prototype.getQueryParameter = function (parameter) {
        var parameterName = parameter.name.text;
        var type = this.getValidatedType(parameter);
        if (!this.supportPathDataType(type)) {
            throw new exceptions_1.GenerateMetadataError(parameter, "Parameter '" + parameterName + "' can't be passed as a query parameter in '" + this.getCurrentLocation() + "'.");
        }
        return {
            default: this.getDefaultValue(parameter.initializer),
            description: this.getParameterDescription(parameter),
            enum: this.getEnumValues(parameter),
            in: 'query',
            name: decoratorUtils_1.getDecoratorTextValue(this.parameter, function (ident) { return ident.text === 'Query'; }) || parameterName,
            required: !parameter.questionToken && !parameter.initializer,
            type: type,
            parameterName: parameterName,
            validators: validatorUtils_1.getParameterValidators(this.parameter, parameterName),
        };
    };
    ParameterGenerator.prototype.getPathParameter = function (parameter) {
        var parameterName = parameter.name.text;
        var type = this.getValidatedType(parameter);
        var pathName = decoratorUtils_1.getDecoratorTextValue(this.parameter, function (ident) { return ident.text === 'Path'; }) || parameterName;
        if (!this.supportPathDataType(type)) {
            throw new exceptions_1.GenerateMetadataError(parameter, "Parameter '" + parameterName + ":" + type + "' can't be passed as a path parameter in '" + this.getCurrentLocation() + "'.");
        }
        if (!this.path.includes("{" + pathName + "}")) {
            throw new exceptions_1.GenerateMetadataError(parameter, "Parameter '" + parameterName + "' can't macth in path: '" + this.path + "'");
        }
        return {
            default: this.getDefaultValue(parameter.initializer),
            description: this.getParameterDescription(parameter),
            in: 'path',
            name: pathName,
            required: true,
            type: type,
            parameterName: parameterName,
            validators: validatorUtils_1.getParameterValidators(this.parameter, parameterName),
        };
    };
    ParameterGenerator.prototype.getParameterDescription = function (node) {
        var symbol = metadataGenerator_1.MetadataGenerator.current.typeChecker.getSymbolAtLocation(node.name);
        var comments = symbol.getDocumentationComment();
        if (comments.length) {
            return ts.displayPartsToString(comments);
        }
        if (node.type) {
            var t = resolveType_1.ResolveType(node.type);
            if (t.enumMembers && t.enumNames && t.enumMembers.length === t.enumNames.length) {
                return '|name|value|\n|-|-|\n' + _.zip(t.enumMembers, t.enumNames).map(function (_a) {
                    var value = _a[0], name = _a[1];
                    return "|" + name + "|" + value + "|";
                }).join('\n');
            }
        }
        return '';
    };
    ParameterGenerator.prototype.supportBodyMethod = function (method) {
        return ['post', 'put', 'patch'].some(function (m) { return m === method.toLowerCase(); });
    };
    ParameterGenerator.prototype.supportParameterDecorator = function (decoratorName) {
        return ['header', 'query', 'parem', 'body', 'bodyprop', 'request'].some(function (d) { return d === decoratorName.toLocaleLowerCase(); });
    };
    ParameterGenerator.prototype.supportPathDataType = function (parameterType) {
        return ['string', 'integer', 'long', 'float', 'double', 'date', 'datetime', 'buffer', 'boolean', 'enum'].find(function (t) { return t === parameterType.typeName; });
    };
    ParameterGenerator.prototype.getValidatedType = function (parameter) {
        if (!parameter.type) {
            throw new exceptions_1.GenerateMetadataError(parameter, "Parameter " + parameter.name + " doesn't have a valid type assigned in '" + this.getCurrentLocation() + "'.");
        }
        return resolveType_1.ResolveType(parameter.type);
    };
    ParameterGenerator.prototype.getEnumValues = function (parameter) {
        if (!parameter.type) {
            throw new Error("Parameter " + parameter.name + " doesn't have a valid type assigned in '" + this.getCurrentLocation() + "'.");
        }
        var t = resolveType_1.ResolveType(parameter.type);
        return t.enumMembers;
    };
    return ParameterGenerator;
}());
exports.ParameterGenerator = ParameterGenerator;
//# sourceMappingURL=parameterGenerator.js.map