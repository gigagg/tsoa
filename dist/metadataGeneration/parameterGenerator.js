"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var metadataGenerator_1 = require("./metadataGenerator");
var expressionParser_1 = require("./expressionParser");
var resolveType_1 = require("./resolveType");
var decoratorUtils_1 = require("./../utils/decoratorUtils");
var _ = require("lodash");
var ts = require("typescript");
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
        return this.getDetailParameter({
            default: this.getDefaultValue(parameter.initializer),
            description: this.getParameterDescription(parameter),
            in: 'request',
            name: parameterName,
            required: !parameter.questionToken && !parameter.initializer,
            type: { typeName: 'object' },
            parameterName: parameterName
        });
    };
    ParameterGenerator.prototype.getBodyPropParameter = function (parameter) {
        var parameterName = parameter.name.text;
        var type = this.getValidatedType(parameter);
        if (!this.supportsBodyParameters(this.method)) {
            throw new Error("Body can't support '" + this.getCurrentLocation() + "' method.");
        }
        return this.getDetailParameter({
            default: this.getDefaultValue(parameter.initializer),
            description: this.getParameterDescription(parameter),
            in: 'body-prop',
            name: decoratorUtils_1.getDecoratorTextValue(this.parameter, function (ident) { return ident.text === 'BodyProp'; }) || parameterName,
            required: !parameter.questionToken && !parameter.initializer,
            type: type,
            parameterName: parameterName
        });
    };
    ParameterGenerator.prototype.getBodyParameter = function (parameter) {
        var parameterName = parameter.name.text;
        var type = this.getValidatedType(parameter);
        if (!this.supportsBodyParameters(this.method)) {
            throw new Error("Body can't support " + this.method + " method");
        }
        return this.getDetailParameter({
            description: this.getParameterDescription(parameter),
            in: 'body',
            name: parameterName,
            required: !parameter.questionToken && !parameter.initializer,
            type: type,
            parameterName: parameterName
        });
    };
    ParameterGenerator.prototype.getHeaderParameter = function (parameter) {
        var parameterName = parameter.name.text;
        var type = this.getValidatedType(parameter);
        if (!this.supportPathDataType(type)) {
            throw new InvalidParameterException("Parameter '" + parameterName + "' can't be passed as a header parameter in '" + this.getCurrentLocation() + "'.");
        }
        return this.getDetailParameter({
            default: this.getDefaultValue(parameter.initializer),
            description: this.getParameterDescription(parameter),
            in: 'header',
            name: decoratorUtils_1.getDecoratorTextValue(this.parameter, function (ident) { return ident.text === 'Header'; }) || parameterName,
            required: !parameter.questionToken && !parameter.initializer,
            type: type,
            parameterName: parameterName,
        });
    };
    ParameterGenerator.prototype.getQueryParameter = function (parameter) {
        var parameterName = parameter.name.text;
        var type = this.getValidatedType(parameter);
        if (!this.supportPathDataType(type)) {
            throw new InvalidParameterException("Parameter '" + parameterName + "' can't be passed as a query parameter in '" + this.getCurrentLocation() + "'.");
        }
        return this.getDetailParameter({
            default: this.getDefaultValue(parameter.initializer),
            description: this.getParameterDescription(parameter),
            enum: this.getEnumValues(parameter),
            in: 'query',
            name: decoratorUtils_1.getDecoratorTextValue(this.parameter, function (ident) { return ident.text === 'Query'; }) || parameterName,
            required: !parameter.questionToken && !parameter.initializer,
            type: type,
            parameterName: parameterName
        });
    };
    ParameterGenerator.prototype.getPathParameter = function (parameter) {
        var parameterName = parameter.name.text;
        var type = this.getValidatedType(parameter);
        var pathName = decoratorUtils_1.getDecoratorTextValue(this.parameter, function (ident) { return ident.text === 'Path'; }) || parameterName;
        if (!this.supportPathDataType(type)) {
            throw new InvalidParameterException("Parameter '" + parameterName + ":" + type + "' can't be passed as a path parameter in '" + this.getCurrentLocation() + "'.");
        }
        if (!this.path.includes("{" + pathName + "}")) {
            throw new Error("Parameter '" + parameterName + "' can't macth in path: '" + this.path + "'");
        }
        return this.getDetailParameter({
            description: this.getParameterDescription(parameter),
            in: 'path',
            name: pathName,
            required: true,
            type: type,
            parameterName: parameterName
        });
    };
    ParameterGenerator.prototype.getDetailParameter = function (parameter) {
        var options = decoratorUtils_1.getDecoratorOptionValue(this.parameter, function (identifier) {
            return ['IsString', 'IsInt', 'IsLong', 'IsDouble', 'IsFloat', 'IsDate', 'IsDateTime', 'IsArray'].some(function (m) { return m === identifier.text; });
        });
        return __assign({}, parameter, { maxLength: options && options.maxLength ? options.maxLength : undefined, minLength: options && options.minLength ? options.minLength : undefined, pattern: options && options.pattern ? options.pattern : undefined, 
            // tslint:disable-next-line:object-literal-sort-keys
            maximum: options && options.max ? options.max : undefined, minimum: options && options.min ? options.min : undefined, maxDate: options && options.maxDate ? options.maxDate : undefined, minDate: options && options.minDate ? options.minDate : undefined, maxItems: options && options.maxItems ? options.maxItems : undefined, minItems: options && options.minItems ? options.minItems : undefined, uniqueItens: options && options.uniqueItens ? options.uniqueItens : undefined });
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
    ParameterGenerator.prototype.supportsBodyParameters = function (method) {
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
            throw new Error("Parameter " + parameter.name + " doesn't have a valid type assigned in '" + this.getCurrentLocation() + "'.");
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
var InvalidParameterException = (function (_super) {
    __extends(InvalidParameterException, _super);
    function InvalidParameterException() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return InvalidParameterException;
}(Error));
//# sourceMappingURL=parameterGenerator.js.map