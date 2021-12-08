"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeEndpointsFromYaml = void 0;
// this functions make route info from yaml.
const js_yaml_1 = __importDefault(require("js-yaml"));
const makeEndpointsFromYaml = (apiYaml, sourceName) => {
    const ret = [];
    const api = js_yaml_1.default.load(apiYaml);
    if (api.openapi && api.openapi.startsWith('3.')) {
        for (const path in api.paths) {
            const endpointPattern = path.replace(/\{([^\}]+)\}/g, (str, p1, offset) => { return ':' + p1; });
            const pathInfo = api.paths[path];
            for (const method in pathInfo) {
                const responseInfo = pathInfo[method];
                const tmp = {
                    pattern: endpointPattern,
                    method: method.toUpperCase(),
                    matches: [],
                    name: responseInfo.operationId,
                    source: sourceName,
                };
                ret.push(tmp);
                for (const status in responseInfo.responses) {
                    const respStatusInfo = responseInfo.responses[status];
                    if (respStatusInfo.content && respStatusInfo.content.hasOwnProperty()) {
                        for (const content in respStatusInfo.content) {
                            const pat = {
                                metadataType: 'immidiate',
                                metadata: {
                                    status: Number(status),
                                    headers: [{
                                            name: 'content-type',
                                            value: content,
                                        }],
                                    datatype: 'object',
                                    data: {
                                        name: 'Sample Data',
                                    },
                                },
                            };
                            tmp.matches.push(pat);
                        }
                    }
                    else {
                        const pat = {
                            metadataType: 'immidiate',
                            metadata: {
                                status: Number(status),
                            },
                        };
                        tmp.matches.push(pat);
                    }
                }
            }
        }
        return ret;
    }
    else {
        throw 'unsupported format. (swagger v2 and so on)';
    }
};
exports.makeEndpointsFromYaml = makeEndpointsFromYaml;
