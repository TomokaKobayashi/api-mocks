"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeEndpointsFromYaml = void 0;
// this functions make route info from yaml.
const js_yaml_1 = __importDefault(require("js-yaml"));
const resolve = (obj, refs) => {
    const [car, ...cdr] = refs;
    if (obj[car]) {
        if (cdr && cdr.length > 0) {
            return resolve(obj[car], cdr);
        }
        return obj[car];
    }
    return undefined;
};
// resolve $ref
// should I use dynamic Function object??
const resolveRef = (apiYaml, ref) => {
    // split ref by slash
    const refs = ref.split("/");
    if (refs[0] !== "#") {
        throw "$ref : only local ref only.";
    }
    const [car, ...cdr] = refs;
    return resolve(apiYaml, cdr);
};
const buildResponse = (apiYaml, current) => {
    if (current.example) {
        // if current has example, return contents of example.
        return current.example;
    }
    else {
        if (current.$ref) {
            const ref = resolveRef(apiYaml, current.$ref);
            return buildResponse(apiYaml, ref);
        }
        else {
            if (current.type && current.type === "array") {
                return [buildResponse(apiYaml, current.items)];
            }
            else if (current.type && current.type === "object") {
                const ret = {};
                for (const key in current.properties) {
                    const prop = current.properties[key];
                    const val = buildResponse(apiYaml, prop);
                    if (val) {
                        ret[key] = val;
                    }
                }
                return ret;
            }
        }
    }
    return undefined;
};
// make JSON response from content object.
const makeJSONResponse = (apiYaml, current) => {
    if (current.example) {
        // if current has example, return contents of example.
        return JSON.stringify(current.example);
    }
    else if (current.schema.properties) {
        // properties in schema directly.
        const ret = {};
        for (const key in current.schema.properties) {
            const prop = current.schema.properties[key];
            const val = buildResponse(apiYaml, prop);
            if (val) {
                ret[key] = val;
            }
        }
        return JSON.stringify(ret);
    }
    else {
        const result = buildResponse(apiYaml, current.schema);
        if (result) {
            return JSON.stringify(result);
        }
    }
    return undefined;
};
// make XML response from content object.
const makeXMLResponse = (apiYaml, current) => {
    console.error("Sorry! XML response is not supported.");
    return undefined;
};
// make headers from example
const makeHeaders = (headers) => {
    const ret = [];
    if (headers) {
        for (const key in headers) {
            const val = headers[key];
            if (val && val.example) {
                ret.push({
                    name: key,
                    value: val.example,
                });
            }
        }
    }
    return ret;
};
const makeEndpointsFromYaml = (apiYaml, sourceName) => {
    const ret = [];
    const api = js_yaml_1.default.load(apiYaml);
    if (api.openapi && api.openapi.startsWith("3.")) {
        for (const path in api.paths) {
            const endpointPattern = path.replace(/\{([^\}]+)\}/g, (str, p1, offset) => {
                return ":" + p1;
            });
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
                    const headers = makeHeaders(respStatusInfo.headers);
                    if (respStatusInfo.content) {
                        for (const content in respStatusInfo.content) {
                            const contentBody = respStatusInfo.content[content];
                            const respData = content === "application/json"
                                ? makeJSONResponse(api, contentBody)
                                : content === "application/xml"
                                    ? makeXMLResponse(api, contentBody)
                                    : content === "text/xml"
                                        ? makeXMLResponse(api, contentBody)
                                        : "Sample value";
                            const pat = {
                                metadataType: "immidiate",
                                metadata: {
                                    status: Number(status),
                                    headers: [
                                        ...headers,
                                        {
                                            name: "content-type",
                                            value: content,
                                        },
                                    ],
                                    datatype: "value",
                                    data: respData,
                                },
                            };
                            tmp.matches.push(pat);
                        }
                    }
                    else {
                        const pat = {
                            metadataType: "immidiate",
                            metadata: {
                                status: Number(status),
                                headers: [...headers],
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
        throw "unsupported format. (swagger v2 and so on)";
    }
};
exports.makeEndpointsFromYaml = makeEndpointsFromYaml;
