"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressTemplate = "\n{{#if useSecurity}}\nimport { set } from 'lodash';\n{{/if}}\n{{#if authenticationModule}}\nimport { expressAuthentication } from '{{authenticationModule}}';\n{{/if}}\n\n/* tslint:disable:forin */\nexport function RegisterRoutes(app: any) {\n    {{#each controllers}}\n    {{#each actions}}\n        app.{{method}}('{{../../basePath}}/{{../path}}{{path}}',\n            {{#if security}}\n            authenticateMiddleware('{{security.name}}'\n                {{#if security.scopes.length}}\n                ,{{{json security.scopes}}}\n                {{/if}}),\n            {{/if}}\n            function (request: any, response: any, next: any) {\n            const args = {\n                {{#each parameters}}\n                    {{@key}}: {{{json this}}},\n                {{/each}}\n            };\n\n            let validatedArgs: any[] = [];\n            try {\n                validatedArgs = getValidatedArgs(args, request);\n            } catch (err) {\n                return next(err);\n            }\n\n            {{#if ../../iocModule}}\n            const controller = iocContainer.get<{{../name}}>({{../name}});\n            {{else}}\n            const controller = new {{../name}}();\n            {{/if}}\n\n\n            const promise = controller.{{name}}.apply(controller, validatedArgs);\n            let statusCode: number|undefined = undefined;\n            if (controller instanceof Controller) {\n                statusCode = (controller as Controller).getStatus();\n            }\n            promiseHandler(promise, statusCode, response, next);\n        });\n    {{/each}}\n    {{/each}}\n\n    {{#if useSecurity}}\n    function authenticateMiddleware(name: string, scopes: string[] = []) {\n        return (request: any, response: any, next: any) => {\n            expressAuthentication(request, name, scopes).then((user: any) => {\n                set(request, 'user', user);\n                next();\n            })\n            .catch((error: any) => {\n                response.status(401);\n                next(error)\n            });\n        }\n    }\n    {{/if}}\n\n    function promiseHandler(promise: any, statusCode: any, response: any, next: any) {\n        return promise\n            .then((data: any) => {\n                if (data) {\n                    response.json(data);\n                    response.status(statusCode || 200);\n                } else {\n                    response.status(statusCode || 204);\n                    response.end();\n                }\n            })\n            .catch((error: any) => next(error));\n    }\n\n    function getValidatedArgs(args: any, request: any): any[] {\n        return Object.keys(args).map(key => {\n            const name = args[key].name;\n            switch (args[key].in) {\n            case 'request':\n                return request;\n            case 'query':\n                return ValidateParam(args[key], request.query[name], models, name)\n            case 'path':\n                return ValidateParam(args[key], request.params[name], models, name)\n            case 'header':\n                return ValidateParam(args[key], request.header(name), models, name);\n            case 'body':\n                return ValidateParam(args[key], request.body, models, name);\n            case 'body-prop':\n                return ValidateParam(args[key], request.body[name], models, name);\n            }\n        });\n    }\n}";
//# sourceMappingURL=express.js.map