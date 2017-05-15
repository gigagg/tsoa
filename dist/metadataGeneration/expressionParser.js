"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var metadataGenerator_1 = require("./metadataGenerator");
function parseBinary(expression) {
    var left = parseExpression(expression.left);
    var right = parseExpression(expression.right);
    switch (expression.operatorToken.kind) {
        case ts.SyntaxKind.PlusToken: return left + right;
        case ts.SyntaxKind.MinusToken: return left - right;
        case ts.SyntaxKind.AsteriskToken: return left * right;
        case ts.SyntaxKind.SlashToken: return left / right;
        case ts.SyntaxKind.PercentToken: return left % right;
        case ts.SyntaxKind.LessThanLessThanToken: return left << right;
        case ts.SyntaxKind.GreaterThanGreaterThanToken: return left >> right;
        case ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken: return left >>> right;
        case ts.SyntaxKind.AmpersandToken: return left & right;
        case ts.SyntaxKind.BarToken: return left | right;
        case ts.SyntaxKind.CaretToken: return left ^ right;
        default: throw new Error('Expression parsing error: not implemented');
    }
}
function parseUnaryPrefix(expression) {
    var operand = parseExpression(expression.operand);
    switch (expression.operator) {
        case ts.SyntaxKind.PlusToken: return +operand;
        case ts.SyntaxKind.MinusToken: return -operand;
        case ts.SyntaxKind.TildeToken: return ~operand;
        default: throw new Error('Expression parsing error: not implemented');
    }
}
function parsePropertyAccessExpression(ex) {
    var type = metadataGenerator_1.MetadataGenerator.current.nodes.find(function (node) {
        if (node.kind === ts.SyntaxKind.ClassDeclaration || ts.SyntaxKind.EnumDeclaration) {
            var classNode = node;
            return !!(classNode.name && (classNode.name.text === ex.expression.text));
        }
        return false;
    });
    if (type) {
        var found = type.members.find(function (n) {
            if (n.name && n.name.kind === ts.SyntaxKind.Identifier) {
                return n.name.text === ex.name.text;
            }
            return false;
        });
        var value = metadataGenerator_1.MetadataGenerator.current.typeChecker.getConstantValue(found);
        if (value !== undefined && value !== null) {
            return value;
        }
        if (found && found.initializer) {
            return parseExpression(found.initializer);
        }
    }
    throw new Error('Expression parsing error: not implemented');
}
function parseNewExpression(expression) {
    var ex = expression;
    if (ex.expression) {
        switch (ex.expression.text) {
            case 'Date': return new (Function.prototype.bind.apply(Date, ex.arguments.map(function (e) { return parseExpression(e); })));
            case 'Number': return new (Function.prototype.bind.apply(Number, ex.arguments.map(function (e) { return parseExpression(e); })));
            case 'String': return new (Function.prototype.bind.apply(String, ex.arguments.map(function (e) { return parseExpression(e); })));
            default: throw new Error('Expression parsing error: not implemented');
        }
    }
    throw new Error('Expression parsing error: not implemented');
}
function parseObjectLiteralExpression(expression) {
    var nestedObject = {};
    expression.properties.forEach(function (p) {
        nestedObject[p.name.text] = parseExpression(p.initializer);
    });
    return nestedObject;
}
function parseExpression(expression) {
    switch (expression.kind) {
        case ts.SyntaxKind.PrefixUnaryExpression: return parseUnaryPrefix(expression);
        case ts.SyntaxKind.BinaryExpression: return parseBinary(expression);
        case ts.SyntaxKind.NumericLiteral: return parseInt(expression.text, 10);
        case ts.SyntaxKind.FirstLiteralToken: return parseInt(expression.text, 10);
        case ts.SyntaxKind.StringLiteral: return expression.text;
        case ts.SyntaxKind.NullKeyword: return null;
        case ts.SyntaxKind.TrueKeyword: return true;
        case ts.SyntaxKind.FalseKeyword: return false;
        case ts.SyntaxKind.ArrayLiteralExpression: return expression.elements.map(function (e) { return parseExpression(e); });
        case ts.SyntaxKind.ObjectLiteralExpression: return parseObjectLiteralExpression(expression);
        case ts.SyntaxKind.NewExpression: return parseNewExpression(expression);
        case ts.SyntaxKind.PropertyAccessExpression: return parsePropertyAccessExpression(expression);
        default: throw new Error('Expression parsing error: not implemented');
    }
}
exports.parseExpression = parseExpression;
//# sourceMappingURL=expressionParser.js.map