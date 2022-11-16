"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const commander_1 = __importDefault(require("commander"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const common_1 = require("common");
const uuid_1 = require("uuid");
const utils_1 = require("./utils");
const jsonc_parser_1 = require("jsonc-parser");
// data to manipulate
let target;
// expand data
const expandData = (basePath, dataType, data) => {
    if (dataType === 'object') {
        return {
            dataType,
            objectData: data
        };
    }
    else if (dataType === 'value') {
        try {
            const parsed = (0, jsonc_parser_1.parse)(data);
            return {
                dataType,
                objectData: parsed,
                rawData: data
            };
        }
        catch (e) {
            return {
                dataType,
                rawData: data
            };
        }
    }
    else if (dataType === 'file') {
        const resolved = path_1.default.resolve(basePath, data);
        try {
            const rawData = fs_1.default.readFileSync(resolved, "utf-8");
            const parsed = (0, jsonc_parser_1.parse)(rawData);
            return {
                dataType,
                objectData: parsed,
                path: data
            };
        }
        catch (e) {
            return {
                dataType,
                path: data
            };
        }
    }
    return undefined;
};
// expand metadata
const expandMetadata = (basePath, metadata) => {
    const ret = {
        status: metadata.status,
        headers: metadata.headers,
        cookies: metadata.cookies,
        customProps: metadata.customProps,
        edit: metadata.edit,
        data: expandData(basePath, metadata.datatype, metadata.data),
    };
    return ret;
};
// load metadata
const loadMetadata = (basePath, metadataPath) => {
    const metadataResolved = path_1.default.resolve(basePath, metadataPath);
    const metadataDir = path_1.default.dirname(metadataResolved);
    const rawMetadata = fs_1.default.readFileSync(metadataResolved, "utf-8");
    const metadata = (0, jsonc_parser_1.parse)(rawMetadata);
    return expandMetadata(metadataDir, metadata);
};
// expand match
const expandMatch = (basePath, match) => {
    const model = {
        conditions: match.conditions,
        metadataType: match.metadataType,
        customProps: match.customProps,
        metadata: match.metadataType === "file"
            ? loadMetadata(basePath, match.metadata)
            : expandMetadata(basePath, match.metadata),
    };
    return model;
};
// expand endpoints
const expandEndpoints = (basePath, endpointsPath, endpoints) => {
    const ret = {
        path: endpointsPath,
        endpoints: [],
    };
    if (!endpoints)
        return ret;
    for (const endpoint of endpoints) {
        const model = {
            pattern: endpoint.pattern,
            method: endpoint.method,
            matches: [],
            name: endpoint.name,
            id: endpoint.id || (0, uuid_1.v4)(),
            source: endpoint.source,
            customProps: endpoint.customProps,
            validatorArgs: endpoint.validatorArgs,
            disabled: endpoint.disabled,
        };
        // expand matches
        for (const match of endpoint.matches) {
            const matchModel = expandMatch(basePath, match);
            model.matches.push(matchModel);
        }
    }
    return ret;
};
const loadEndpoints = (basePath, endpointPath) => {
    const resolved = path_1.default.resolve(basePath, endpointPath);
    if (!fs_1.default.existsSync(resolved)) {
        return {
            path: resolved,
            endpoints: []
        };
    }
    const endpointsDir = path_1.default.dirname(resolved);
    const rawEndpoints = fs_1.default.readFileSync(resolved, "utf-8");
    const parent = (0, jsonc_parser_1.parse)(rawEndpoints);
    if (!parent.endpoints) {
        return {
            path: resolved,
            endpoints: []
        };
    }
    return expandEndpoints(endpointsDir, endpointPath, parent.endpoints);
};
// read routes
const readRoutes = (fileName) => {
    // is exist?
    const exists = fs_1.default.existsSync(fileName);
    if (!exists) {
        // create new empty routes.
        return {
            basePath: path_1.default.dirname(fileName),
            endpoints: [
                {
                    path: common_1.INNER_ENDPOINTS,
                    endpoints: [],
                },
            ],
        };
    }
    // decide filepath and dirname.
    const stat = fs_1.default.statSync(fileName);
    const isDir = stat.isDirectory();
    const routesFile = isDir ? path_1.default.join(fileName, "routes.json") : fileName;
    const routesDir = isDir ? fileName : path_1.default.dirname(fileName);
    // read and parse
    const rawData = fs_1.default.readFileSync(routesFile, "utf-8");
    // parse
    const rawRoutes = (0, jsonc_parser_1.parse)(rawData);
    // construct routes
    const routes = {
        basePath: routesDir,
        prefix: rawRoutes.prefix,
        defaultHeaders: rawRoutes.defaultHeaders,
        suppressHeaders: rawRoutes.suppressHeaders,
        scripts: rawRoutes.scripts,
        defaultScript: rawRoutes.defaultScript,
        endpointsType: rawRoutes.endpointsType,
        endpointsPath: rawRoutes.endpointsPath,
        endpoints: [],
        customProps: rawRoutes.customProps,
        version: rawRoutes.version,
    };
    // expand endpoints
    if (!rawRoutes.endpointsType || rawRoutes.endpointsType === "immediate") {
        const ep = expandEndpoints(routesDir, common_1.INNER_ENDPOINTS, rawRoutes.endpoints);
        if (ep)
            routes.endpoints.push(ep);
    }
    else if (rawRoutes.endpointsType === "file" && rawRoutes.endpointsPath) {
        const ep = loadEndpoints(routesDir, rawRoutes.endpointsPath);
        if (ep)
            routes.endpoints.push(ep);
    }
    else if (rawRoutes.endpointsType === "dir" && rawRoutes.endpointsPath) {
        const stat = fs_1.default.statSync(rawRoutes.endpointsPath);
        if (stat.isDirectory()) {
            const files = (0, utils_1.findFiles)(rawRoutes.endpointsPath, /^.+\.jsonc?$/);
            if (files) {
                for (const file of files) {
                    const dirName = path_1.default.dirname(file);
                    const fileName = path_1.default.basename(file);
                    const ep = loadEndpoints(dirName, fileName);
                    if (ep)
                        routes.endpoints.push(ep);
                }
            }
        }
    }
    return routes;
};
// save routes
const saveRoutes = (fileName, routes) => { };
// parsing parameters.
commander_1.default
    .version("0.0.1", "-v --version")
    .usage("[options]")
    .option("-p --port <portNo>", "listen port number", parseInt)
    .option("-r --routes <directory>", "routes directory")
    .parse(process.argv);
// port number.
const port = commander_1.default.getOptionValue("port") || 4020;
const routes = commander_1.default.getOptionValue("routes");
if (!routes) {
    console.error("ERROR!!! : -r or --routes is required.");
    process.exit(1);
}
// initialze this app.
target = readRoutes(routes);
// create app
const app = (0, express_1.default)();
// static contents for gui
const publicDir = path_1.default.resolve(module.path, "../public");
console.log(`gui dir = ${publicDir}`);
const statHandler = express_1.default.static(publicDir);
const pubRouter = express_1.default.Router();
pubRouter.use("/gui", statHandler);
app.use(pubRouter);
// api endpoints
const apiRouter = express_1.default.Router();
app.use("/api", apiRouter);
// starting to serve
app.listen(port, () => {
    console.log(`started on port ${port}`);
});
