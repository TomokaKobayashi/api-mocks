"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadMetadata = exports.processMetadata = void 0;
// COPYRIGHT 2021 Kobayashi, Tomoka
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// request summary memo:
// JSON -> body -> data
// FORM -> body -> data
// QUERY PARMAS -> query -> data
// PATH PARAMS -> params -> data
// MULTI-PART -> body(raw string and content-type is missed) -> data
// HEADERS -> headers -> headers
// COOKIES -> cookies -> cookies
const processMetadata = (basePath, metadata, req, res) => {
    try {
        if (metadata.headers) {
            for (const header of metadata.headers) {
                res.set(header.name, header.value);
            }
        }
        if (metadata.cookies) {
            for (const cookie of metadata.cookies) {
                res.cookie(cookie.name, cookie.value);
            }
        }
        const respStatus = metadata.status
            ? metadata.status
            : metadata.data
                ? 200
                : 204;
        if (metadata.data) {
            if (!metadata.datatype || metadata.datatype === "file") {
                const dataFileName = metadata.data;
                const dataPath = path_1.default.isAbsolute(dataFileName)
                    ? dataFileName
                    : basePath + "/" + dataFileName;
                console.log("dataPath=" + dataPath);
                const data = fs_1.default.readFileSync(dataPath);
                res.status(respStatus).send(data);
            }
            else if (metadata.datatype === "object") {
                const data = JSON.stringify(metadata.data);
                res.status(respStatus).send(data);
            }
            else if (metadata.datatype === "value") {
                const data = metadata.data;
                res.status(respStatus).send(data);
            }
        }
        else {
            console.log("no data");
            res.status(respStatus).send();
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error);
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
