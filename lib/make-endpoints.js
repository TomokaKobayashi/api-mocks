"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeEndpointsFromYaml = void 0;
// this functions make route info from yaml.
const js_yaml_1 = __importDefault(require("js-yaml"));
const uuid_1 = require("uuid");
// resolve ref to obujet
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
// build response from example fields.
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
        else if (current.properties) {
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
        else if (current.type && current.type === "array") {
            return [buildResponse(apiYaml, current.items)];
        }
        else if (current.type === 'integer') {
            if (current.format === 'int32') {
                return -1 * 2 ^ 31;
            }
            return -1 * Number.MAX_SAFE_INTEGER;
        }
        else if (current.type === 'number') {
            return -1 * Number.MAX_VALUE;
        }
        else if (current.type === 'string') {
            switch (current.format) {
                case 'date':
                    return '2021-12-31';
                case 'date-time':
                    return '2021-12-31T23:59:59Z';
                case 'byte':
                    return 'QUJDREVGRw==';
                default:
                    return 'string';
            }
        }
        else if (current.type === 'boolean') {
            return false;
        }
    }
    return undefined;
};
// make response object from content object.
const makeResponseObject = (apiYaml, contentBody) => {
    if (contentBody.example) {
        // if contentBody has example, it returns contents of example.
        return contentBody.example;
    }
    else {
        const result = buildResponse(apiYaml, contentBody.schema);
        if (result) {
            return result;
        }
    }
    return undefined;
};
// make XML structure from schema and response object
const buildXMLStructure = (apiYaml, current, respObject, name) => {
    if (current.$ref) {
        const ref = resolveRef(apiYaml, current.$ref);
        return buildXMLStructure(apiYaml, ref, respObject, name);
    }
    else if (current.type && current.type === 'array') {
        // array type
        if (Array.isArray(respObject)) {
            // strange document because of no root name.
            if (!name)
                return undefined;
            const item = current.items;
            if (current.xml && current.xml.wrapped) {
                const wrap = current.xml.name;
                const ret = {
                    name: wrap,
                    attributes: {},
                    children: []
                };
                for (const val of respObject) {
                    const tmp = buildXMLStructure(apiYaml, item, val, wrap);
                    if (tmp) {
                        ret.children.push(tmp);
                    }
                }
                return ret;
            }
            else {
                const ret = {
                    name,
                    attributes: {},
                    children: [],
                };
                for (const val of respObject) {
                    const tmp = buildXMLStructure(apiYaml, item, val, undefined);
                    if (tmp) {
                        ret.children.push(tmp);
                    }
                }
                return ret;
            }
        }
    }
    else if (current.properties) {
        // object type
        const ret = {
            name: current.xml && current.xml.name ? current.xml.name : name,
            attributes: {},
            children: [],
        };
        for (const key in current.properties) {
            const val = respObject[key];
            const item = current.properties[key];
            if (val) {
                const tmp = buildXMLStructure(apiYaml, item, val, key);
                if (tmp) {
                    if (item.xml && item.xml.attribute) {
                        ret.attributes[key] = tmp;
                    }
                    else {
                        ret.children.push(tmp);
                    }
                }
            }
        }
        return ret;
    }
    else if (current.type) {
        // other types
        if (name) {
            return {
                name,
                attributes: {},
                children: [],
                value: '' + respObject,
            };
        }
    }
    return undefined;
};
const convertToXML = (xml) => {
    const attribs = [];
    for (const key in xml.attributes) {
        attribs.push(`${key}="${xml.attributes[key].value}"`);
    }
    const openTag = (xml.name + ' ' + attribs.join(' ')).trim();
    if (xml.children.length > 0) {
        const childXML = [];
        for (const child of xml.children) {
            childXML.push(convertToXML(child));
        }
        return `<${openTag}>${childXML.join('')}</${xml.name}>`;
    }
    else {
        if (xml.value) {
            // terminal node
            return `<${openTag}>${xml.value}</${xml.name}>`;
        }
        else {
            // no child node
            return `<${openTag}/>`;
        }
    }
};
// make XML response from content object.
const makeXMLResponse = (apiYaml, contentBody, respObject) => {
    // map respObject to xml
    const xmlStructure = buildXMLStructure(apiYaml, contentBody.schema, respObject, undefined);
    if (xmlStructure) {
        const retValue = convertToXML(xmlStructure);
        return retValue;
    }
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
// rough copy method...
const easyCopy = (obj) => {
    if (!obj)
        return undefined;
    return JSON.parse(JSON.stringify(obj));
};
const replaceRef = (apiYaml, node) => {
    if (!node)
        return;
    if (Array.isArray(node)) {
        for (const child of node) {
            replaceRef(apiYaml, child);
        }
    }
    else if (typeof node === 'object') {
        for (const key in node) {
            let child = node[key];
            if (child && child.$ref) {
                child = easyCopy(resolveRef(apiYaml, child.$ref));
                child.$ref = undefined;
                node[key] = child;
            }
            replaceRef(apiYaml, child);
        }
    }
};
const makeValidatorParams = (apiYaml, methodInfo) => {
    // rough copy
    const params = easyCopy(methodInfo.parameters);
    replaceRef(apiYaml, params);
    const body = easyCopy(methodInfo.requestBody);
    replaceRef(apiYaml, body);
    const ret = {
        parameters: params,
        requestBody: body,
    };
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
                const methodInfo = pathInfo[method];
                const validatorParams = makeValidatorParams(api, methodInfo);
                const tmp = {
                    pattern: endpointPattern,
                    method: method.toUpperCase(),
                    matches: [],
                    name: methodInfo.operationId,
                    source: sourceName,
                    validatorArgs: validatorParams,
                    count: 1,
                    id: (0, uuid_1.v4)(),
                };
                ret.push(tmp);
                for (const status in methodInfo.responses) {
                    const respStatusInfo = methodInfo.responses[status];
                    const headers = makeHeaders(respStatusInfo.headers);
                    const contentLen = respStatusInfo.content ? Object.keys(respStatusInfo.content).length : 0;
                    if (contentLen > 0) {
                        for (const content in respStatusInfo.content) {
                            const contentBody = respStatusInfo.content[content];
                            const respObject = makeResponseObject(api, contentBody);
                            if (respObject) {
                                const respData = content === "application/json"
                                    ? JSON.stringify(respObject)
                                    : content === "application/xml"
                                        ? makeXMLResponse(api, contentBody, respObject)
                                        : content === "text/xml"
                                            ? makeXMLResponse(api, contentBody, respObject)
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
