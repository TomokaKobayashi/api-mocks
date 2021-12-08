"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRouteFromYaml = void 0;
// this functions make route info from yaml.
const js_yaml_1 = __importDefault(require("js-yaml"));
const makeRouteFromYaml = (apiYaml) => {
    const api = js_yaml_1.default.load(apiYaml);
    if (api.openapi && api.openapi.startsWith('3.')) {
        for (const path in api.paths) {
            const pathInfo = api.paths[path];
            for (const method in pathInfo) {
                const responseInfo = pathInfo[method];
                for (const status in responseInfo.responses) {
                    const respStatusInfo = responseInfo.responses[status];
                    console.log(`${method} : ${status} : ${path}`);
                    if (respStatusInfo.content && respStatusInfo.content.hasOwnProperty()) {
                        for (const content in respStatusInfo.content) {
                            console.log(`${method} : ${status} : ${content} : ${path}`);
                        }
                    }
                    else {
                        console.log(`${method} : ${status} : NO-CONTENTS : ${path}`);
                    }
                }
            }
        }
        return {};
    }
    else {
        throw 'unsupported format. (swagger v2 and so on)';
    }
};
exports.makeRouteFromYaml = makeRouteFromYaml;
