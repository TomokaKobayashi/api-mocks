"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findFiles = exports.loadMetadata = exports.processMetadata = exports.evaluateConditions = exports.setState = exports.getState = void 0;
// COPYRIGHT 2021 Kobayashi, Tomoka
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const response_modifier_1 = require("./response-modifier");
// state Object
let state = {};
const getState = () => state;
exports.getState = getState;
const setState = (st) => {
    state = Object.assign(Object.assign({}, state), st);
};
exports.setState = setState;
// request summary memo:
// JSON -> body -> data
// FORM -> body -> data
// QUERY PARMAS -> query -> data
// PATH PARAMS -> params -> data
// MULTI-PART -> body(raw string and content-type is missed) -> data
// HEADERS -> headers -> headers
// COOKIES -> cookies -> cookies
const evaluateConditions = (req, conditions) => {
    if (!conditions)
        return true;
    try {
        const result = new Function("req", "state", `
      const {data, headers, cookies} = req;
      if(${conditions}) return true;
      return false;
      `)(req, state);
        return result;
    }
    catch (error) {
        console.log("*** condition parse error ***");
        console.log(conditions);
        console.log(error);
    }
    return false;
};
exports.evaluateConditions = evaluateConditions;
const processMetadata = (basePath, metadata, defaultScript, req, res) => {
    try {
        const headers = {};
        if (metadata.headers) {
            for (const header of metadata.headers) {
                headers[header.name.toLowerCase()] = header.value;
            }
        }
        const cookies = {};
        if (metadata.cookies) {
            for (const cookie of metadata.cookies) {
                cookies[cookie.name] = cookie.value;
            }
        }
        const respStatus = metadata.status
            ? metadata.status
            : metadata.data
                ? 200
                : 204;
        const respSummary = {
            status: respStatus,
            headers,
            cookies,
        };
        if (metadata.data) {
            if (!metadata.datatype || metadata.datatype === "file") {
                const dataFileName = metadata.data;
                const dataPath = path_1.default.isAbsolute(dataFileName)
                    ? dataFileName
                    : basePath + "/" + dataFileName;
                console.log("dataPath=" + dataPath);
                const data = fs_1.default.readFileSync(dataPath);
                if (headers["content-type"] &&
                    headers["content-type"].indexOf("application/json") >= 0) {
                    respSummary.data = JSON.parse(data.toString());
                }
                else {
                    respSummary.rawData = data;
                }
            }
            else if (metadata.datatype === "object") {
                respSummary.data = metadata.data;
            }
            else if (metadata.datatype === "value") {
                respSummary.rawData = metadata.data;
            }
        }
        // modify response
        if (defaultScript) {
            const func = (0, response_modifier_1.getFunction)(defaultScript);
            if (func) {
                func(req, respSummary, state);
            }
        }
        if (metadata.edit) {
            const func = (0, response_modifier_1.getFunction)(metadata.edit);
            if (func) {
                func(req, respSummary, state);
            }
        }
        // set headers
        for (const key in respSummary.headers) {
            res.set(key, respSummary.headers[key]);
        }
        // set cookies
        for (const key in respSummary.cookies) {
            res.cookie(key, respSummary.cookies[key]);
        }
        if (respSummary.data) {
            res
                .status(respSummary.status)
                .write(JSON.stringify(respSummary.data), () => res.send());
        }
        if (respSummary.rawData) {
            res
                .status(respSummary.status)
                .write(respSummary.rawData, () => res.send());
        }
        else {
            res.status(respStatus).send();
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).write(error, () => res.send());
    }
};
exports.processMetadata = processMetadata;
const loadMetadata = (baseDir, filePath) => {
    const metadataPath = path_1.default.isAbsolute(filePath)
        ? filePath
        : baseDir + "/" + filePath;
    console.log("definitionPath=" + metadataPath);
    const rawDef = fs_1.default.readFileSync(metadataPath);
    const metadata = JSON.parse(rawDef.toString());
    return { metadata, baseDir: path_1.default.dirname(metadataPath) };
};
exports.loadMetadata = loadMetadata;
const findFiles = (dirName, pattern) => {
    const ret = [];
    const dir = fs_1.default.readdirSync(dirName);
    for (const file of dir) {
        const filePath = path_1.default.join(dirName, file);
        if (pattern.test(file)) {
            ret.push(filePath);
        }
        else {
            const stat = fs_1.default.statSync(filePath);
            if (stat.isDirectory()) {
                const children = (0, exports.findFiles)(filePath, pattern);
                if (children)
                    ret.push(...children);
            }
        }
    }
    if (ret.length == 0)
        return undefined;
    return ret;
};
exports.findFiles = findFiles;
