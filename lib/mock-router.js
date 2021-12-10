"use strict";
// COPYRIGHT 2021 Kobayashi, Tomoka
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockRouter = void 0;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const express_form_data_1 = __importDefault(require("express-form-data"));
const types_1 = require("./types");
const control_router_1 = require("./control-router");
// request summary memo:
// JSON -> body -> data
// FORM -> body -> data
// QUERY PARMAS -> query -> data
// PATH PARAMS -> params -> data
// MULTI-PART -> body(raw string and content-type is missed) -> data
// HEADERS -> headers -> headers
const processMetadata = (basePath, defaultHeaders, metadata, req, res) => {
    try {
        if (defaultHeaders) {
            for (const header of defaultHeaders) {
                res.set(header.name, header.value);
            }
        }
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
const evaluateConditions = (req, conditions) => {
    if (!conditions)
        return true;
    try {
        const result = new Function("req", `
      const {data, headers} = req;
      if(${conditions}) return true;
      return false;
    `)(req);
        return result;
    }
    catch (error) {
        console.log("*** condition parse error ***");
        console.log(conditions);
        console.log(error);
    }
    return false;
};
const loadMetadata = (baseDir, filePath) => {
    const metadataPath = path_1.default.isAbsolute(filePath)
        ? filePath
        : baseDir + "/" + filePath;
    console.log("definitionPath=" + metadataPath);
    const rawDef = fs_1.default.readFileSync(metadataPath);
    const metadata = JSON.parse(rawDef.toString());
    return { metadata, baseDir: path_1.default.dirname(metadataPath) };
};
/// making a endpoint handler
const createHnadler = (baseDir, patterns, defaultHeaders) => {
    function mockHandler(req, res, next) {
        const requestSummary = {
            data: Object.assign(Object.assign(Object.assign({}, req.query), req.params), req.body),
            headers: req.headers,
            cookies: req.cookies,
        };
        console.log(`requested summary = ${JSON.stringify(requestSummary, null, "  ")}`);
        let proceed = false;
        for (const pat of patterns) {
            if (evaluateConditions(requestSummary, pat.conditions)) {
                proceed = true;
                if (!pat.metadataType || pat.metadataType === "file") {
                    const metadata = loadMetadata(baseDir, pat.metadata);
                    processMetadata(metadata.baseDir, mockHandler.defaultHeaders, metadata.metadata, req, res);
                }
                else if (pat.metadataType === "immidiate") {
                    processMetadata(baseDir, mockHandler.defaultHeaders, pat.metadata, req, res);
                }
                break;
            }
        }
        if (!proceed) {
            next();
        }
    }
    mockHandler.defaultHeaders = defaultHeaders;
    return mockHandler;
};
const makePrefixPattern = (prefix) => {
    if (!prefix)
        return new RegExp("[^/]*");
    if (Array.isArray(prefix)) {
        if (prefix.length === 0) {
            return new RegExp("[^/]*");
        }
        return new RegExp(`(${prefix.join("|")})`);
    }
    else {
        return new RegExp(`(${prefix})`);
    }
};
const makePrefixRouter = (baseDir, routes) => {
    const prefix = routes && routes.prefix ? routes.prefix : undefined;
    const prefixPattern = makePrefixPattern(prefix);
    const prefixRouter = express_1.default.Router();
    const mockRouter = express_1.default.Router();
    prefixRouter.use(prefixPattern, mockRouter);
    // apply mock endpoint handlers.
    if (routes && routes.endpoints) {
        for (const endpoint of routes.endpoints) {
            switch (endpoint.method) {
                case "GET":
                    console.log(`GET    : ${endpoint.pattern}`);
                    mockRouter.get(endpoint.pattern, createHnadler(baseDir, endpoint.matches, routes.defaultHeaders));
                    break;
                case "POST":
                    console.log(`POST   : ${endpoint.pattern}`);
                    mockRouter.post(endpoint.pattern, createHnadler(baseDir, endpoint.matches, routes.defaultHeaders));
                    break;
                case "PUT":
                    console.log(`PUT    : ${endpoint.pattern}`);
                    mockRouter.put(endpoint.pattern, createHnadler(baseDir, endpoint.matches, routes.defaultHeaders));
                    break;
                case "PATCH":
                    console.log(`PATCH  : ${endpoint.pattern}`);
                    mockRouter.patch(endpoint.pattern, createHnadler(baseDir, endpoint.matches, routes.defaultHeaders));
                    break;
                case "DELETE":
                    console.log(`DELETE : ${endpoint.pattern}`);
                    mockRouter.delete(endpoint.pattern, createHnadler(baseDir, endpoint.matches, routes.defaultHeaders));
                    break;
                default:
                    console.error(`error: method '${endpoint.method}' is not supported.`);
                    throw `'${endpoint.method}' is not supported.`;
            }
        }
    }
    return prefixRouter;
};
const makeRoutesDir = (config) => {
    if (config && config.routesPath) {
        if (fs_1.default.existsSync(config.routesPath)) {
            const stat = fs_1.default.statSync(config.routesPath);
            if (stat.isDirectory()) {
                return config.routesPath;
            }
            else {
                return path_1.default.dirname(config.routesPath);
            }
        }
    }
    // default is current directory.
    return ".";
};
const makeRoutesPath = (config) => {
    if (config && config.routesPath && fs_1.default.existsSync(config.routesPath)) {
        const stat = fs_1.default.statSync(config.routesPath);
        const routesFileName = stat.isDirectory()
            ? `${config.routesPath}/${types_1.DEFAULT_ROUTES_FILE}`
            : config.routesPath;
        return routesFileName;
    }
    return undefined;
};
// load routes file
const loadRoutes = (config) => {
    if (config && config.routesPath) {
        const routesFileName = makeRoutesPath(config);
        if (routesFileName) {
            const rawRoutes = fs_1.default.readFileSync(routesFileName);
            const routes = JSON.parse(rawRoutes.toString());
            return routes;
        }
    }
    return undefined;
};
// change deector
// detects routes settings (on memory or file).
// change the targetRouter's routes new setting.
const makeChangeDetector = (config, routes, targetRouter) => {
    function changeDetector(req, res, next) {
        if (changeDetector.needsUpdateFile && changeDetector.routesFileName) {
            const stat = fs_1.default.statSync(changeDetector.routesFileName);
            if (changeDetector.routesTimestamp != stat.mtime.getTime()) {
                console.log("*** ROUTES FILE CHANGE DETECTED ***");
                changeDetector.routesTimestamp = stat.mtime.getTime();
                const rawRoutes = fs_1.default.readFileSync(changeDetector.routesFileName);
                const newRoutes = JSON.parse(rawRoutes.toString());
                const prefixRouter = makePrefixRouter(changeDetector.routesDir, newRoutes);
                changeDetector.targetRouter.stack.splice(0);
                changeDetector.targetRouter.use(prefixRouter);
                changeDetector.routes = newRoutes;
                console.log("*** ROUTES IS RECONSTRUCTED ***");
            }
        }
        if (changeDetector.isChanged) {
            console.log("*** ROUTES ON MEMORY CHANGE DETECTED ***");
            const prefixRouter = makePrefixRouter(changeDetector.routesDir, changeDetector.routes);
            changeDetector.targetRouter.stack.splice(0);
            changeDetector.targetRouter.use(prefixRouter);
            changeDetector.isChanged = false;
            console.log("*** ROUTES IS RECONSTRUCTED ***");
        }
        next();
    }
    // custom function properties
    const routesFileName = makeRoutesPath(config);
    if (routesFileName) {
        const stat = fs_1.default.statSync(routesFileName);
        changeDetector.routesFileName = routesFileName;
        changeDetector.routesTimestamp = stat.mtime.getTime();
        changeDetector.routesDir = makeRoutesDir(config);
    }
    changeDetector.targetRouter = targetRouter;
    changeDetector.routes = routes;
    changeDetector.isChanged = false;
    changeDetector.needsUpdateFile = config && config.needRoutesUpdate;
    return changeDetector;
};
/// making a router from difinition file.
const mockRouter = (config) => {
    const routes = loadRoutes(config);
    // root router is the entry point.
    const rootRouter = express_1.default.Router();
    rootRouter.use(express_1.default.urlencoded({ extended: true }));
    rootRouter.use(express_1.default.json());
    // express-form-data needs temporary directory to upload.
    if (config && config.uploadPath) {
        rootRouter.use(express_form_data_1.default.parse({ uploadDir: config.uploadPath, autoClean: true }));
        rootRouter.use(express_form_data_1.default.union());
    }
    // apply middlewares.
    if (config && config.preprocessMiddle) {
        if (Array.isArray(config.preprocessMiddle)) {
            if (config.preprocessMiddle.length > 0) {
                for (const middle of config.preprocessMiddle) {
                    if (typeof middle == "function") {
                        rootRouter.use(middle);
                    }
                }
            }
        }
        else {
            rootRouter.use(config.preprocessMiddle);
        }
    }
    // prefix router is mocking root.
    const routesDir = makeRoutesDir(config);
    const prefixRouter = makePrefixRouter(routesDir, routes);
    // thunk router is the target of change detector.
    const thunkRouter = express_1.default.Router();
    thunkRouter.use(prefixRouter);
    // apply change detector.
    const changeDetector = makeChangeDetector(config, routes, thunkRouter);
    rootRouter.use(changeDetector);
    // apply thunk router.
    rootRouter.use(thunkRouter);
    // create control router.
    if (config === null || config === void 0 ? void 0 : config.apiRoot) {
        const ctrlRouter = (0, control_router_1.controlRouter)(config.apiRoot, changeDetector);
        rootRouter.use(ctrlRouter);
    }
    return rootRouter;
};
exports.mockRouter = mockRouter;
