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
const fast_xml_parser_1 = __importDefault(require("fast-xml-parser"));
const types_1 = require("./types");
const control_router_1 = require("./control-router");
const openapi_request_validator_1 = __importDefault(require("openapi-request-validator"));
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
;
// making a data modifier
// if parameter needs array-type, convert a single parameter to an array.
// if request body is xml, to JSON.
const createRequestModifier = (validatorArgs) => {
    if (!validatorArgs || !validatorArgs.parameters)
        return undefined;
    const modifierList = { header: [], path: [], query: [], cookie: [] };
    for (const param of validatorArgs.parameters) {
        const v3Param = param;
        if (v3Param && v3Param.schema && modifierList[v3Param.in]) {
            const place = modifierList[v3Param.in];
            const schema = v3Param.schema;
            if (schema.type && schema.type === 'array') {
                place.push((parameters) => {
                    if (parameters && parameters[v3Param.name]) {
                        const val = parameters[v3Param.name];
                        if (val && !Array.isArray(val)) {
                            parameters[v3Param.name] = [val];
                        }
                    }
                });
                if (schema.items) {
                    const items = schema.items;
                    if (items.default) {
                        place.push((parameters) => {
                            console.log(`${v3Param.name} : ${parameters[v3Param.name]}`);
                            if (parameters && !parameters[v3Param.name]) {
                                if (items.format === 'string') { }
                                parameters[v3Param.name] = items.format === 'string' ? ['' + items.default] : [items.default];
                            }
                        });
                    }
                    if (items.type === 'integer' || items.type === 'number') {
                        place.push((parameters) => {
                            if (parameters && parameters[v3Param.name]) {
                                parameters[v3Param.name] = parameters[v3Param.name].map((element) => {
                                    return Number(element);
                                });
                            }
                        });
                    }
                }
            }
            else {
                if (schema.default) {
                    place.push((parameters) => {
                        if (parameters && !parameters[v3Param.name]) {
                            parameters[v3Param.name] = schema.format === 'string' ? '' + schema.default : schema.default;
                        }
                    });
                }
                if (schema.type === 'integer' || schema.type === 'number') {
                    place.push((parameters) => {
                        if (parameters && parameters[v3Param.name]) {
                            parameters[v3Param.name] = Number(parameters[v3Param.name]);
                        }
                    });
                }
            }
        }
    }
    return (req) => {
        if (modifierList.header)
            modifierList.header.forEach((modify) => { modify(req.headers); });
        if (modifierList.path)
            modifierList.path.forEach((modify) => { modify(req.params); });
        if (modifierList.query)
            modifierList.query.forEach((modify) => { modify(req.query); });
        if (modifierList.cookie)
            modifierList.cookie.forEach((modify) => { modify(req.cookies); });
    };
};
/// making a endpoint handler
const createHnadler = (baseDir, endpoint) => {
    const modifier = createRequestModifier(endpoint.validatorArgs);
    const validator = !endpoint.validatorArgs ? undefined : new openapi_request_validator_1.default(endpoint.validatorArgs);
    function mockHandler(req, res, next) {
        // modify request
        if (modifier) {
            modifier(req);
        }
        const requestSummary = {
            data: Object.assign(Object.assign(Object.assign({}, req.query), req.params), req.body),
            headers: req.headers,
            cookies: req.cookies,
        };
        console.log(`requested summary = ${JSON.stringify(requestSummary, null, "  ")}`);
        // validation
        if (validator) {
            const validationResult = validator.validateRequest(req);
            if (validationResult) {
                const data = {
                    errors: validationResult
                };
                res.status(422).send(JSON.stringify(data));
                return;
            }
        }
        let proceed = false;
        for (const pat of endpoint.matches) {
            if (evaluateConditions(requestSummary, pat.conditions)) {
                proceed = true;
                if (!pat.metadataType || pat.metadataType === "file") {
                    const metadata = loadMetadata(baseDir, pat.metadata);
                    processMetadata(metadata.baseDir, metadata.metadata, req, res);
                }
                else if (pat.metadataType === "immidiate") {
                    processMetadata(baseDir, pat.metadata, req, res);
                }
                break;
            }
        }
        if (!proceed) {
            res.status(404).send();
        }
    }
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
const makeResponseHeaderModifier = (routes) => {
    if (!routes || (!routes.defaultHeaders && !routes.suppressHeaders))
        return undefined;
    const modifiers = [];
    if (routes.defaultHeaders) {
        const headers = routes.defaultHeaders;
        modifiers.push((res) => {
            for (const header of headers) {
                res.setHeader(header.name, header.value);
            }
        });
    }
    if (routes.suppressHeaders) {
        const headers = routes.suppressHeaders;
        modifiers.push((res) => {
            for (const header of headers) {
                res.removeHeader(header);
            }
        });
    }
    if (modifiers.length == 0)
        return undefined;
    return (req, res, next) => {
        for (const modifier of modifiers) {
            modifier(res);
        }
        next();
    };
};
const makePrefixRouter = (baseDir, routes) => {
    const prefix = routes && routes.prefix ? routes.prefix : undefined;
    const prefixPattern = makePrefixPattern(prefix);
    const prefixRouter = express_1.default.Router();
    const mockRouter = express_1.default.Router();
    const headerModifier = makeResponseHeaderModifier(routes);
    if (headerModifier) {
        mockRouter.use(headerModifier);
    }
    prefixRouter.use(prefixPattern, mockRouter);
    // apply mock endpoint handlers.
    if (routes && routes.endpoints) {
        for (const endpoint of routes.endpoints) {
            switch (endpoint.method) {
                case "GET":
                    console.log(`GET    : ${endpoint.pattern}`);
                    mockRouter.get(endpoint.pattern, createHnadler(baseDir, endpoint));
                    break;
                case "POST":
                    console.log(`POST   : ${endpoint.pattern}`);
                    mockRouter.post(endpoint.pattern, createHnadler(baseDir, endpoint));
                    break;
                case "PUT":
                    console.log(`PUT    : ${endpoint.pattern}`);
                    mockRouter.put(endpoint.pattern, createHnadler(baseDir, endpoint));
                    break;
                case "PATCH":
                    console.log(`PATCH  : ${endpoint.pattern}`);
                    mockRouter.patch(endpoint.pattern, createHnadler(baseDir, endpoint));
                    break;
                case "DELETE":
                    console.log(`DELETE : ${endpoint.pattern}`);
                    mockRouter.delete(endpoint.pattern, createHnadler(baseDir, endpoint));
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
    return {
        endpoints: [],
    };
};
// xml body parser middleware by fast-xml-parser
const CONTENT_TYPE_XML = /.*\/xml/;
const CHARSET_PATTERN = /charset=([^ ;]+)/;
const xmlBodyParser = (req, res, next) => {
    const contentType = req.headers['content-type'];
    if (contentType && CONTENT_TYPE_XML.test(contentType)) {
        const mat = contentType.match(CHARSET_PATTERN);
        const encoding = mat ? mat[1] : 'utf8';
        // object for closure.
        const dataObj = {
            data: ''
        };
        req.setEncoding(encoding);
        req.on('data', (chunk) => {
            dataObj.data = dataObj.data + chunk;
        });
        req.on('end', () => {
            // parse data
            const parser = new fast_xml_parser_1.default.XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
            const data = dataObj.data;
            const result = parser.parse(data);
            req.body.xml = result;
            next();
        });
    }
    else {
        next();
    }
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
    // XMLparser bodyParser
    rootRouter.use(xmlBodyParser);
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
