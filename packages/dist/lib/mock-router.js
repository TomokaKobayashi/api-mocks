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
const uuid_1 = require("uuid");
const utils_1 = require("./utils");
const response_modifier_1 = require("./response-modifier");
;
const makeContentTypePattern = (contentType) => {
    const pat = contentType.replace(/[*]/g, '[^/]+');
    return new RegExp(pat);
};
const xmlToJSON = (obj, schema) => {
    if (typeof obj === 'undefined')
        return undefined;
    if (schema.type === 'array') {
        const items = schema.items;
        if (schema.xml && schema.xml.wrapped) {
            const ret = [];
            const name = (items.xml && items.xml.name) ? items.xml.name : schema.xml.name ? schema.xml.name : undefined;
            if (name) {
                const obj2 = obj[name];
                if (!Array.isArray(obj2)) {
                    const val = xmlToJSON(obj2, items);
                    if (val)
                        ret.push(val);
                }
                else {
                    for (const node of obj2) {
                        const val = xmlToJSON(node, items);
                        if (val)
                            ret.push(val);
                    }
                }
                return ret;
            }
        }
        return xmlToJSON(obj, items);
    }
    else if (schema.properties) {
        const ret = {};
        for (const key in schema.properties) {
            const sub = schema.properties[key];
            if (sub.xml && sub.xml.name) {
                ret[key] = xmlToJSON(obj[sub.xml.name], sub);
            }
            else {
                ret[key] = xmlToJSON(obj[key], sub);
            }
        }
        return ret;
    }
    else {
        return obj;
    }
};
const createXMLToObjectModifier = (validatorArgs) => {
    if (!validatorArgs || !validatorArgs.requestBody)
        return undefined;
    const body = validatorArgs.requestBody;
    const contents = body.content;
    let target = undefined;
    for (const content in contents) {
        const pat = makeContentTypePattern(content);
        if (pat.test('application/xml') || pat.test('text/xml')) {
            target = contents[content];
            break;
        }
    }
    if (!target || !target.schema)
        return undefined;
    const schema = target.schema;
    // no name top level object is not allowed.
    // named and wrapped property is not structure name. 
    if (!schema.xml || !schema.xml.name)
        return undefined;
    const name = schema.xml.name;
    return (req) => {
        if (!req.xml)
            return;
        if (!req.xml[name])
            return;
        const ret = xmlToJSON(req.xml[name], schema);
        if (!ret)
            return;
        req.body = Object.assign(Object.assign({}, req.body), ret);
        return;
    };
};
// making a data modifier
// if parameter needs array-type, convert a single parameter to an array.
// if request body is xml, to JSON.
const createRequestModifier = (validatorArgs) => {
    const xmlModifier = createXMLToObjectModifier(validatorArgs);
    if (!validatorArgs || !validatorArgs.parameters) {
        if (xmlModifier) {
            return (req) => {
                if (xmlModifier)
                    xmlModifier(req);
            };
        }
        return undefined;
    }
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
        if (xmlModifier)
            xmlModifier(req);
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
const createHnadler = (baseDir, endpoint, defaultScript) => {
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
            if ((0, utils_1.evaluateConditions)(requestSummary, pat.conditions)) {
                proceed = true;
                if (!pat.metadataType || pat.metadataType === "file") {
                    const metadata = (0, utils_1.loadMetadata)(baseDir, pat.metadata);
                    (0, utils_1.processMetadata)(metadata.baseDir, metadata.metadata, defaultScript, requestSummary, res);
                }
                else if (pat.metadataType === "immidiate") {
                    (0, utils_1.processMetadata)(baseDir, pat.metadata, defaultScript, requestSummary, res);
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
                    mockRouter.get(endpoint.pattern, createHnadler(baseDir, endpoint, routes.defaultScript));
                    break;
                case "POST":
                    console.log(`POST   : ${endpoint.pattern}`);
                    mockRouter.post(endpoint.pattern, createHnadler(baseDir, endpoint, routes.defaultScript));
                    break;
                case "PUT":
                    console.log(`PUT    : ${endpoint.pattern}`);
                    mockRouter.put(endpoint.pattern, createHnadler(baseDir, endpoint, routes.defaultScript));
                    break;
                case "PATCH":
                    console.log(`PATCH  : ${endpoint.pattern}`);
                    mockRouter.patch(endpoint.pattern, createHnadler(baseDir, endpoint, routes.defaultScript));
                    break;
                case "DELETE":
                    console.log(`DELETE : ${endpoint.pattern}`);
                    mockRouter.delete(endpoint.pattern, createHnadler(baseDir, endpoint, routes.defaultScript));
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
            for (const endpoint of routes.endpoints) {
                if (!endpoint.id) {
                    endpoint.id = (0, uuid_1.v4)();
                }
            }
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
            req.xml = result;
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
    const routesDir = makeRoutesDir(config);
    // load scripts
    console.log('routes.scripts = ' + routes.scripts);
    if (routes.scripts) {
        const scriptPath = path_1.default.resolve(routesDir, routes.scripts);
        (0, response_modifier_1.loadScripts)(scriptPath);
    }
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
