"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var moment = require("moment");
var validator = require("validator");
var models = null;
function ValidateParam(schema, value, generatedModels, name) {
    if (name === void 0) { name = ''; }
    models = generatedModels;
    if (value === undefined || value === null) {
        if (schema.required) {
            throw new InvalidRequestException("'" + name + "' is a required " + schema.in + " parameter.");
        }
        else {
            return undefined;
        }
    }
    switch (schema.typeName) {
        case 'string':
            return validateString(value, name);
        case 'boolean':
            return validateBool(value, name);
        case 'integer':
        case 'long':
            return validateInt(value, name);
        case 'float':
        case 'double':
            return validateFloat(value, name);
        case 'enum':
            return validateEnum(value, name, schema.enumMembers);
        case 'array':
            return validateArray(value, name, schema.array);
        case 'date':
            return validateDate(value, name);
        case 'datetime':
            return validateDateTime(value, name);
        case 'buffer':
            return validateBuffer(value, name);
        default:
            return validateModel(value, schema.typeName);
    }
}
exports.ValidateParam = ValidateParam;
function validateInt(numberValue, name) {
    if (!validator.isInt(numberValue + '')) {
        throw new InvalidRequestException(name + ' should be a valid integer.');
    }
    return validator.toInt(numberValue + '', 10);
}
function validateFloat(numberValue, name) {
    if (!validator.isFloat(numberValue + '')) {
        throw new InvalidRequestException(name + ' should be a valid float.');
    }
    return validator.toFloat(numberValue + '');
}
function validateEnum(enumValue, name, members) {
    if (!members) {
        throw new InvalidRequestException(name + ' no member.');
    }
    var existValue = members.filter(function (m) { return m === enumValue; });
    if (!existValue || !enumValue.length || !existValue.length) {
        throw new InvalidRequestException(name + ' should be one of the following; ' + members.join(', '));
    }
    return existValue[0];
}
function validateDate(dateValue, name) {
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateValue.match(regEx)) {
        throw new InvalidRequestException(name + ' should be a valid date, i.e. YYYY-MM-DD');
    }
    return new Date(dateValue);
}
function validateDateTime(datetimeValue, name) {
    var validatedDate = moment(datetimeValue, moment.ISO_8601, true);
    if (!validatedDate.isValid()) {
        throw new InvalidRequestException(name + ' should be a valid ISO 8601 date, i.e. YYYY-MM-DDTHH:mm:ss');
    }
    return validatedDate.toDate();
}
function validateString(stringValue, name) {
    if (typeof stringValue !== 'string') {
        throw new InvalidRequestException(name + ' should be a valid string.');
    }
    return stringValue.toString();
}
function validateBool(boolValue, typeName) {
    if (boolValue === true || boolValue === false) {
        return boolValue;
    }
    if (boolValue.toLowerCase() === 'true') {
        return true;
    }
    if (boolValue.toLowerCase() === 'false') {
        return false;
    }
    throw new InvalidRequestException(name + ' should be valid boolean value.');
}
function validateModel(modelValue, typeName) {
    var modelDefinition = models[typeName];
    if (modelDefinition) {
        if (modelDefinition.properties) {
            Object.keys(modelDefinition.properties).forEach(function (key) {
                var property = modelDefinition.properties[key];
                modelValue[key] = ValidateParam(property, modelValue[key], models, key);
            });
        }
        if (modelDefinition.additionalProperties) {
            Object.keys(modelValue).forEach(function (key) {
                var validatedValue = null;
                for (var _i = 0, _a = modelDefinition.additionalProperties; _i < _a.length; _i++) {
                    var additionalProperty = _a[_i];
                    try {
                        validatedValue = ValidateParam(additionalProperty, modelValue[key], models, key);
                        break;
                    }
                    catch (err) {
                        continue;
                    }
                }
                if (validatedValue) {
                    modelValue[key] = validatedValue;
                }
                else {
                    throw new Error("No matching model found in additionalProperties to validate " + key);
                }
            });
        }
    }
    return modelValue;
}
function validateArray(arrayValue, name, schema) {
    if (!schema) {
        throw new InvalidRequestException(name + ' array invalid.');
    }
    return arrayValue.map(function (value) {
        return ValidateParam(schema, value, models, undefined);
    });
}
function validateBuffer(value, name) {
    return new Buffer(value);
}
var InvalidRequestException = (function () {
    function InvalidRequestException(message) {
        this.message = message;
        this.status = 400;
        this.name = 'Invalid Request';
    }
    return InvalidRequestException;
}());
//# sourceMappingURL=templateHelpers.js.map