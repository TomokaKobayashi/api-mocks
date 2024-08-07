// COPYRIGHT 2021 Kobayashi, Tomoka

import express from "express";
import fs from "fs";
import path from "path";
import form from "express-form-data";
import fastXMLparser from "fast-xml-parser";
import cookieParser from "cookie-parser";
import { Routes, Metadata, Endpoint, Header } from "common";
import {
  RequestSummary,
  RouterConfig,
  DEFAULT_ROUTES_FILE,
  ChangeDetector,
  XMLRequest,
  EndpointsChangeDetector,
} from "./types";
import { controlRouter } from "./control-router";
import OpenAPIRequestValidator, {
  OpenAPIRequestValidatorArgs,
} from "openapi-request-validator";
import { OpenAPIV3 } from "openapi-types";
import { v4 } from "uuid";
import { evaluateConditions, findFiles, loadMetadata, processMetadata } from "./utils";
import { loadScripts } from "./response-modifier";
import { parse } from "jsonc-parser";

type Modifier = (parameters: any) => void;
interface ModifierList {
  [key: string]: Modifier[];
}

const makeContentTypePattern = (contentType: string) => {
  const pat = contentType.replace(/[*]/g, "[^/]+");
  return new RegExp(pat);
};

const xmlToJSON = (obj: any, schema: OpenAPIV3.SchemaObject): any => {
  if (typeof obj === "undefined") return undefined;
  if (schema.type === "array") {
    const items = schema.items as OpenAPIV3.SchemaObject;
    if (schema.xml && schema.xml.wrapped) {
      const ret = [];
      const name =
        items.xml && items.xml.name
          ? items.xml.name
          : schema.xml.name
          ? schema.xml.name
          : undefined;
      if (name) {
        const obj2 = obj[name];
        if (!Array.isArray(obj2)) {
          const val = xmlToJSON(obj2, items);
          if (val) ret.push(val);
        } else {
          for (const node of obj2) {
            const val = xmlToJSON(node, items);
            if (val) ret.push(val);
          }
        }
        return ret;
      }
    }
    return xmlToJSON(obj, items);
  } else if (schema.properties) {
    const ret: any = {};
    for (const key in schema.properties) {
      const sub = schema.properties[key] as OpenAPIV3.SchemaObject;
      if (sub.xml && sub.xml.name) {
        ret[key] = xmlToJSON(obj[sub.xml.name], sub);
      } else {
        ret[key] = xmlToJSON(obj[key], sub);
      }
    }
    return ret;
  } else {
    return obj;
  }
};

const createXMLToObjectModifier = (
  validatorArgs: OpenAPIRequestValidatorArgs | undefined
) => {
  if (!validatorArgs || !validatorArgs.requestBody) return undefined;
  const body = validatorArgs.requestBody;
  const contents = body.content;
  let target = undefined;
  for (const content in contents) {
    const pat = makeContentTypePattern(content);
    if (pat.test("application/xml") || pat.test("text/xml")) {
      target = contents[content];
      break;
    }
  }
  if (!target || !target.schema) return undefined;
  const schema = target.schema as OpenAPIV3.SchemaObject;
  // no name top level object is not allowed.
  // named and wrapped property is not structure name.
  if (!schema.xml || !schema.xml.name) return undefined;
  const name = schema.xml.name;
  return (req: XMLRequest) => {
    if (!req.xml) return;
    if (!req.xml[name]) return;
    const ret = xmlToJSON(req.xml[name], schema);
    if (!ret) return;
    req.body = { ...req.body, ...ret };
    return;
  };
};

// making a data modifier
// if parameter needs array-type, convert a single parameter to an array.
// if request body is xml, to JSON.
const createRequestModifier = (
  validatorArgs: OpenAPIRequestValidatorArgs | undefined
) => {
  const xmlModifier = createXMLToObjectModifier(validatorArgs);
  if (!validatorArgs || !validatorArgs.parameters) {
    if (xmlModifier) {
      return (req: XMLRequest) => {
        if (xmlModifier) xmlModifier(req);
      };
    }
    return undefined;
  }
  const modifierList: ModifierList = {
    header: [],
    path: [],
    query: [],
    cookie: [],
  };
  for (const param of validatorArgs.parameters) {
    const v3Param = param as OpenAPIV3.ParameterObject;
    if (v3Param && v3Param.schema && modifierList[v3Param.in]) {
      const place = modifierList[v3Param.in];
      const schema = v3Param.schema as OpenAPIV3.SchemaObject;
      if (schema.type && schema.type === "array") {
        place.push((parameters: any) => {
          if (parameters && parameters[v3Param.name]) {
            const val = parameters[v3Param.name];
            if (val && !Array.isArray(val)) {
              parameters[v3Param.name] = [val];
            }
          }
        });
        if (schema.items) {
          const items = schema.items as OpenAPIV3.SchemaObject;
          if (items.default) {
            place.push((parameters: any) => {
              console.log(`${v3Param.name} : ${parameters[v3Param.name]}`);
              if (parameters && !parameters[v3Param.name]) {
                if (items.format === "string") {
                }
                parameters[v3Param.name] =
                  items.format === "string"
                    ? ["" + items.default]
                    : [items.default];
              }
            });
          }
          if (items.type === "integer" || items.type === "number") {
            place.push((parameters: any) => {
              if (parameters && parameters[v3Param.name]) {
                parameters[v3Param.name] = parameters[v3Param.name].map(
                  (element: any) => {
                    return Number(element);
                  }
                );
              }
            });
          }
        }
      } else {
        if (schema.default) {
          place.push((parameters: any) => {
            if (parameters && !parameters[v3Param.name]) {
              parameters[v3Param.name] =
                schema.format === "string"
                  ? "" + schema.default
                  : schema.default;
            }
          });
        }
        if (schema.type === "integer" || schema.type === "number") {
          place.push((parameters: any) => {
            if (parameters && parameters[v3Param.name]) {
              parameters[v3Param.name] = Number(parameters[v3Param.name]);
            }
          });
        }
      }
    }
  }
  return (req: XMLRequest) => {
    if (xmlModifier) xmlModifier(req);
    if (modifierList.header)
      modifierList.header.forEach((modify) => {
        modify(req.headers);
      });
    if (modifierList.path)
      modifierList.path.forEach((modify) => {
        modify(req.params);
      });
    if (modifierList.query)
      modifierList.query.forEach((modify) => {
        modify(req.query);
      });
    if (modifierList.cookie)
      modifierList.cookie.forEach((modify) => {
        modify(req.cookies);
      });
  };
};

/// making a endpoint handler
const createHnadler = (
  baseDir: string,
  endpoint: Endpoint,
  defaultScript?: string
) => {
  const modifier = createRequestModifier(endpoint.validatorArgs);
  const validator = !endpoint.validatorArgs
    ? undefined
    : new OpenAPIRequestValidator(endpoint.validatorArgs);

  function mockHandler(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    // modify request
    if (modifier) {
      modifier(req);
    }

    // parse JSON in multipart request
    if(endpoint.bodyJson){
      if(req.body[endpoint.bodyJson]){
        const unparsed = req.body[endpoint.bodyJson];
        try{
          const parsed = JSON.parse(unparsed);
          if(endpoint.bodyJsonUnion){
            req.body = {
              ...req.body,
              ...parsed,
            };
            req.body[endpoint.bodyJson] = undefined;
          }else{
            req.body[endpoint.bodyJson] = parsed;  
          }
        }catch(e){
          // no action
        }
      }
    }

    const requestSummary: RequestSummary = {
      data: {
        ...req.query,
        ...req.params,
        ...req.body,
      },
      headers: req.headers,
      cookies: req.cookies,
    };
    console.log(
      `requested summary = ${JSON.stringify(requestSummary, null, "  ")}`
    );

    // validation
    if (validator) {
      const validationResult = validator.validateRequest(req);
      if (validationResult) {
        const data = {
          errors: validationResult,
        };
        res.status(422).write(JSON.stringify(data), () => res.send());
        return;
      }
    }

    let proceed = false;
    for (const pat of endpoint.matches) {
      if (evaluateConditions(requestSummary, pat.conditions)) {
        proceed = true;
        if (!pat.metadataType || pat.metadataType === "file") {
          const metadata = loadMetadata(baseDir, pat.metadata as string);
          processMetadata(
            metadata.baseDir,
            metadata.metadata,
            defaultScript,
            requestSummary,
            res
          );
        } else if (pat.metadataType === "immediate") {
          processMetadata(
            baseDir,
            pat.metadata as Metadata,
            defaultScript,
            requestSummary,
            res
          );
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

const makePrefixPattern = (prefix: string | string[] | undefined): RegExp => {
  if (!prefix) return new RegExp("[^/]*");
  if (Array.isArray(prefix)) {
    if (prefix.length === 0) {
      return new RegExp("[^/]*");
    }
    return new RegExp(`(${prefix.join("|")})`);
  } else {
    return new RegExp(`(${prefix})`);
  }
};

const makeResponseHeaderModifier = (routes: Routes | undefined) => {
  if (!routes || (!routes.defaultHeaders && !routes.suppressHeaders))
    return undefined;
  const modifiers: ((res: express.Response) => void)[] = [];
  if (routes.defaultHeaders) {
    const headers = routes.defaultHeaders;
    modifiers.push((res: express.Response) => {
      for (const header of headers) {
        res.setHeader(header.name, header.value);
      }
    });
  }
  if (routes.suppressHeaders) {
    const headers = routes.suppressHeaders;
    modifiers.push((res: express.Response) => {
      for (const header of headers) {
        res.removeHeader(header);
      }
    });
  }
  if (modifiers.length == 0) return undefined;
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    for (const modifier of modifiers) {
      modifier(res);
    }
    next();
  };
};

const makeEndpoints = (
  endpoints: Endpoint[],
  baseDir: string,
  defaultScript?: string
) => {
  const mockRouter = express.Router();

  for (const endpoint of endpoints) {
    if(!endpoint.id){
      endpoint.id = v4();
    }
    switch (endpoint.method) {
      case "GET":
        console.log(`GET    : ${endpoint.pattern}`);
        mockRouter.get(
          endpoint.pattern,
          createHnadler(baseDir, endpoint, defaultScript)
        );
        break;
      case "POST":
        console.log(`POST   : ${endpoint.pattern}`);
        mockRouter.post(
          endpoint.pattern,
          createHnadler(baseDir, endpoint, defaultScript)
        );
        break;
      case "PUT":
        console.log(`PUT    : ${endpoint.pattern}`);
        mockRouter.put(
          endpoint.pattern,
          createHnadler(baseDir, endpoint, defaultScript)
        );
        break;
      case "PATCH":
        console.log(`PATCH  : ${endpoint.pattern}`);
        mockRouter.patch(
          endpoint.pattern,
          createHnadler(baseDir, endpoint, defaultScript)
        );
        break;
      case "DELETE":
        console.log(`DELETE : ${endpoint.pattern}`);
        mockRouter.delete(
          endpoint.pattern,
          createHnadler(baseDir, endpoint, defaultScript)
        );
        break;
      default:
        console.error(`error: method '${endpoint.method}' is not supported.`);
        throw `'${endpoint.method}' is not supported.`;
    }
  }
  return mockRouter;
};

const getDir = (filePath?: string) => {
  if (filePath) {
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        return filePath;
      } else {
        return path.dirname(filePath);
      }
    }
  }
  // default is current directory.
  return ".";
};

// make change detector for endpoints.
const makeEndpointsChangeDetector = (
  targetRouter: express.Router,
  fileName: string,
  defaultScript?: string
): EndpointsChangeDetector => {
  const stat = fs.statSync(fileName);
  const dir = getDir(fileName);
  function changeDetector(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const stat = fs.statSync(changeDetector.endpointsFileName);
    if (stat.mtime.getTime() !== changeDetector.endpointsTimestamp) {
      // modified
      console.log("*** ENDPOINTS FILE CHANGE DETECTED ***");
      changeDetector.endpointsTimestamp = stat.mtime.getTime();
      const rawEndpoints = fs.readFileSync(
        changeDetector.endpointsFileName,
        "utf-8"
      );
      const newEndpoints = parse(rawEndpoints);
      if (newEndpoints.endpoints) {
        const newEndpoitnsRouter = makeEndpoints(
          newEndpoints.endpoints as Endpoint[],
          changeDetector.endpointsDir,
          changeDetector.defaultScript
        );
        changeDetector.targetRouter.stack.splice(0);
        changeDetector.targetRouter.use(newEndpoitnsRouter);
        console.log(`*** ENDPOINTS ${fileName} IS RECONSTRUCTED ***`);
      }
    }
    next();
  }
  changeDetector.targetRouter = targetRouter;
  changeDetector.endpointsFileName = fileName;
  changeDetector.endpointsDir = dir;
  changeDetector.endpointsTimestamp = stat.mtime.getTime();
  changeDetector.defaultScript = defaultScript;
  return changeDetector;
};

// make endpoints from a file.
const makeEndpointsFromFile = (
  endpointsFile: string,
  routes: Routes | undefined
) => {
  const rawEndpoints = fs.readFileSync(endpointsFile, "utf-8");
  const endpointsData = parse(rawEndpoints);
  if (endpointsData.endpoints) {
    const dir = getDir(endpointsFile);
    const endpoints = makeEndpoints(
      endpointsData.endpoints as Endpoint[],
      dir,
      routes ? routes.defaultScript : undefined
    );

    const thunkRouter = express.Router();
    thunkRouter.use(endpoints);
    const changeDetector = makeEndpointsChangeDetector(
      thunkRouter,
      endpointsFile
    );

    const root = express.Router();
    root.use(changeDetector);
    root.use(thunkRouter);
    return root;
  }
  return undefined;
};

// make endpoints from files in directory
const jsonPattern = /^.+\.jsonc?$/;
const mekaEndpointsFromDir = (
  basePath: string,
  endpointsDir: string,
  routes: Routes | undefined
) => {
  const binder = express.Router();
  const resolvedBase = path.resolve(basePath, endpointsDir);
  const files = findFiles(resolvedBase, jsonPattern);
  if(files){
    for(const file of files){
      try{
        const router = makeEndpointsFromFile(file, routes);
        if (router) {
          binder.use(router);
        }
      }catch(err){
        console.error(`ERROR!!! endpoint file '${file}' is skipped.`);
        console.error(err);
      }
    }
  }
  return binder;
};

const makePrefixRouter = (baseDir: string, routes: Routes | undefined) => {
  const prefix = routes && routes.prefix ? routes.prefix : undefined;
  const prefixPattern = makePrefixPattern(prefix);
  const prefixRouter = express.Router();
  const mockRouter = express.Router();
  const headerModifier = makeResponseHeaderModifier(routes);
  if (headerModifier) {
    mockRouter.use(headerModifier);
  }
  prefixRouter.use(prefixPattern, mockRouter);

  // apply mock endpoint handlers.
  if (routes) {
    if (routes.endpointsType === "file") {
      if (routes.endpointsPath) {
        const resolvedPath = path.resolve(baseDir, routes.endpointsPath);
        const router = makeEndpointsFromFile(resolvedPath, routes);
        if (router) {
          mockRouter.use(router);
        }
      }
    } else if (routes.endpointsType === "dir") {
      if (routes.endpointsPath) {
        const router = mekaEndpointsFromDir(baseDir, routes.endpointsPath, routes);
        mockRouter.use(router);
      }
    } else {
      if(routes.endpoints){
        const router = makeEndpoints(
          routes.endpoints,
          baseDir,
          routes.defaultScript
        );
        mockRouter.use(router);
      }
    }
  }
  return prefixRouter;
};

const makeRoutesPath = (config: RouterConfig | undefined) => {
  if (config && config.routesPath && fs.existsSync(config.routesPath)) {
    const stat = fs.statSync(config.routesPath);
    const routesFileName = stat.isDirectory()
      ? `${config.routesPath}/${DEFAULT_ROUTES_FILE}`
      : config.routesPath;
    return routesFileName;
  }
  return undefined;
};

// load routes file
const loadRoutes = (config: RouterConfig | undefined): Routes => {
  if (config && config.routesPath) {
    const routesFileName = makeRoutesPath(config);
    if (routesFileName) {
      const rawRoutes = fs.readFileSync(routesFileName);
      const routes = parse(rawRoutes.toString()) as Routes;
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
const xmlBodyParser = (
  req: XMLRequest,
  res: express.Response,
  next: express.NextFunction
) => {
  const contentType = req.headers["content-type"];
  if (contentType && CONTENT_TYPE_XML.test(contentType)) {
    const mat = contentType.match(CHARSET_PATTERN);
    const encoding = mat ? mat[1] : "utf8";
    // object for closure.
    const dataObj = {
      data: "",
    };
    req.setEncoding(encoding as BufferEncoding);
    req.on("data", (chunk) => {
      dataObj.data = dataObj.data + chunk;
    });
    req.on("end", () => {
      // parse data
      const parser = new fastXMLparser.XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "",
      });
      const data = dataObj.data;
      const result = parser.parse(data);
      req.xml = result;
      next();
    });
  } else {
    next();
  }
};

// change deector
// detects routes settings (on memory or file).
// change the targetRouter's routes new setting.
const makeChangeDetector = (
  config: RouterConfig | undefined,
  routes: Routes,
  targetRouter: express.Router
): ChangeDetector => {
  function changeDetector(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    if (changeDetector.routesFileName) {
      const stat = fs.statSync(changeDetector.routesFileName);
      if (changeDetector.routesTimestamp != stat.mtime.getTime()) {
        console.log("*** ROUTES FILE CHANGE DETECTED ***");
        changeDetector.routesTimestamp = stat.mtime.getTime();
        const rawRoutes = fs.readFileSync(changeDetector.routesFileName);
        const newRoutes = parse(rawRoutes.toString()) as Routes;
        const prefixRouter = makePrefixRouter(
          changeDetector.routesDir,
          newRoutes
        );
        changeDetector.targetRouter.stack.splice(0);
        changeDetector.targetRouter.use(prefixRouter);
        changeDetector.routes = newRoutes;
        console.log("*** ROUTES IS RECONSTRUCTED ***");
      }
    }
    if (changeDetector.isChanged) {
      console.log("*** ROUTES ON MEMORY CHANGE DETECTED ***");
      const prefixRouter = makePrefixRouter(
        changeDetector.routesDir,
        changeDetector.routes
      );
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
    const stat = fs.statSync(routesFileName);
    changeDetector.routesFileName = routesFileName;
    changeDetector.routesTimestamp = stat.mtime.getTime();
    changeDetector.routesDir = getDir(config ? config.routesPath : undefined);
  }
  changeDetector.targetRouter = targetRouter;
  changeDetector.routes = routes;
  changeDetector.isChanged = false;
  return changeDetector;
};

const corsMiddleware = (allowHeaders?: string) => (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, access_token" + (allowHeaders ? `, ${allowHeaders}` : '')
  );

  // intercept OPTIONS method
  if ("OPTIONS" === req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
};

/// making a router from difinition file.
export const mockRouter = (config?: RouterConfig): express.Router => {
  const routes = loadRoutes(config);
  const routesDir = getDir(config ? config.routesPath : undefined);

  // add default endopints
  if(!routes.endpoints){
    routes.endpoints = [];
  }

  // load scripts
  if (routes.scripts) {
    const scriptPath = path.resolve(routesDir, routes.scripts);
    loadScripts(scriptPath);
  }

  // root router is the entry point.
  const rootRouter = express.Router();
  if (config && config.enableCors) {
    console.log(`allowHeaders=${config.allowHeaders}`);
    rootRouter.use(corsMiddleware(config.allowHeaders));
  }
  console.log(`maxReceiveSize=${config?.maxReceiveSize}`);
  rootRouter.use(express.urlencoded({ extended: true, limit: config?.maxReceiveSize }));
  rootRouter.use(express.json({limit: config?.maxReceiveSize}));
  rootRouter.use(cookieParser());

  // express-form-data needs temporary directory to upload.
  if (config && config.uploadPath) {
    rootRouter.use(
      form.parse({ uploadDir: config.uploadPath, autoClean: !config.keepUploadFile })
    );
    rootRouter.use(form.union());
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
    } else {
      rootRouter.use(config.preprocessMiddle);
    }
  }

  // prefix router is mocking root.
  const prefixRouter = makePrefixRouter(routesDir, routes);

  // thunk router is the target of change detector.
  const thunkRouter = express.Router();
  thunkRouter.use(prefixRouter);

  // apply change detector.
  const changeDetector = makeChangeDetector(config, routes, thunkRouter);
  rootRouter.use(changeDetector);

  // apply thunk router.
  rootRouter.use(thunkRouter);

  // create control router.
  if (config?.apiRoot) {
    const ctrlRouter = controlRouter(config.apiRoot, changeDetector);
    rootRouter.use(ctrlRouter);
  }

  return rootRouter;
};
