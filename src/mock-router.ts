// COPYRIGHT 2021 Kobayashi, Tomoka

import express from 'express';
import fs from 'fs';
import path from 'path';
import form from 'express-form-data';
import { IncomingHttpHeaders } from 'http';

// memo:
// JSON -> body -> data
// FORM -> body -> data
// QUERY PARMAS -> query -> data
// PATH PARAMS -> params -> data
// MULTI-PART -> body(raw string and content-type is missed) -> data
// HEADERS -> headers -> headers

// general map string to T.
interface Record<T> {
  [key: string]: T
};

// headers definition in Metadata.
type Headers = {
  // header name
  name: string
  // header value
  value: string
};

// response metadata with status, headers and response data.
type Metadata = {
  // response status
  status?: number
  // response headers
  headers: Headers[]
  // body data type(default: file)
  datatype?: 'file' | 'value' | 'object'
  // response body data file or immediate value or object
  data?: string | Record<any>
  // javascript string to edit response data(only JSON data or headers)
  edit?: string
};

// response pattern definition.
type Pattern = {
  // condition to use following 'metadata'
  // conditions is written in javascript condition expression.
  // it is evaluated by Function object.
  // like this, 'data.param1===\"AAAA\" || data.param2===\"BBBB\"
  conditions?: string
  // type of metadata(default: file)
  metadataType?: 'file' | 'immidiate'
  // response metadata file path or Metadata by JSON
  metadata: string | Metadata
};

// endpoint definition
type Endpoint = {
  // endpoint path pattern string (not RegExp)
  //  basic: /foo/bar
  //  with path parameters: /foo/bar/:para1/:para2
  pattern: string
  // http method
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  // response definition with conditions
  matches: Pattern[]
  // API name(optional)
  name?: string 
};

// structure definition of 'routers.json'
type Routes = {
  // endpoint prefix pattern RegExp.
  // `/prefix` of '/prefix/foo/var'.
  // if prefix is Array, matches all of Array.
  // '["/prefix1", "/prefix2"]' is to be '(/prefix1|/prefix2)' .
  prefix: string[] | string

  // response headers to apply all responses(exclude error).
  // ** not yet implemented **
  defaultHeaders?: Headers[]

  // javascript string to edit all responses(exclude error).
  // it can edit response body when 'Content-Type' is 'application/json'.
  // ** not yet implemented **
  defaultScript?: string

  // endpoints 
  endpoints: Endpoint[]
}

// default routes file name.
const DEFAULT_ROUTES_FILE = 'routes.json';

export type RouterConfig = {
  // a path to 'routes.json'.
  routesPath: string
  // controlling api's root path of this mock server
  apiRoot: string
  // a temporary directory is used when file upload.
  uploadPath: string
  // preprocess middles run before handler
  preprocessMiddle?: express.Handler[] | express.Handler
}

// request data is use to evaluate condiitons of matching.
type RequestSummary = {
  // data from body, params and query of req.
  data: Record<any>
  // headers form headers of req.
  headers: IncomingHttpHeaders
};

const processMetadata = (basePath: string, metadata: Metadata, req: express.Request, res: express.Response) => {
  try{
    for(const header of metadata.headers){
      res.set(header.name, header.value);
    }
    const respStatus = metadata.status || metadata.data ? 200 : 204;
    if(metadata.data){
      if(!metadata.datatype || metadata.datatype==='file'){
        const dataFileName = metadata.data as string;
        const dataPath = path.isAbsolute(dataFileName) ? dataFileName : basePath + '/' + dataFileName;
        console.log('dataPath=' + dataPath);
        const data = fs.readFileSync(dataPath);
        res.status(respStatus).send(data);
      }else if(metadata.datatype==='object'){
        const data = JSON.stringify(metadata.data);
        res.status(respStatus).send(data);
      }else if(metadata.datatype==='value'){
        const data = metadata.data;
        res.status(respStatus).send(data);
      }
    }else{
      console.log('no data');
      for(const header of metadata.headers){
        res.set(header.name, header.value);
      }
      res.status(respStatus).send();
    }
  }catch(error){
    console.log(error);
    res.status(500).send(error);
  }
};

const evaluateConditions = (req: RequestSummary, conditions?: string): boolean => {
  if(!conditions) return true;
  try{
    const result = new Function('req', `
      const {data, headers} = req;
      if(${conditions}) return true;
      return false;
    `)(req);
    return result;
  }catch(error){
    console.log('*** condition parse error ***');
    console.log(conditions);
    console.log(error);
  }
  return false;
};

const loadMetadata = (baseDir: string, filePath: string) => {
  const metadataPath = path.isAbsolute(filePath) ? filePath : baseDir + '/' + filePath;
  console.log('definitionPath=' + metadataPath);
  const rawDef = fs.readFileSync(metadataPath);
  const metadata = JSON.parse(rawDef.toString()) as Metadata;
  return {metadata, baseDir: path.dirname(metadataPath)};
};

/// making a endpoint handler
const createHnadler = (baseDir: string, patterns: Pattern[]) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const requestSummary: RequestSummary = {
      data:{
        ...req.query,
        ...req.params,
        ...req.body,
      },
      headers: req.headers,
    };
    console.log(`requested summary = ${JSON.stringify(requestSummary, null, '  ')}`);

    let proceed = false;
    for(const pat of patterns){
      if(evaluateConditions(requestSummary, pat.conditions)){
        proceed = true;
        if(!pat.metadataType || pat.metadataType==='file'){
          const metadata = loadMetadata(baseDir, pat.metadata as string);
          processMetadata(metadata.baseDir, metadata.metadata, req, res);
        }else if(pat.metadataType==='immidiate'){
          processMetadata(baseDir, pat.metadata as Metadata, req, res);
        }
        break;
      }
    }
    if(!proceed){
      next();
    }
  }
};

const makePrefixPattern = (prefix: string | string[] | undefined): RegExp => {
  if(!prefix) return new RegExp('[^/]*');
  if(Array.isArray(prefix)){
    if(prefix.length===0){
      return new RegExp('[^/]*');
    }
    return new RegExp(`(${prefix.join('|')})`);
  }else{
    return new RegExp(`(${prefix})`);
  }
};

const makePrefixRouter = (baseDir: string, routes: Routes | undefined) => {
  const prefix = routes && routes.prefix ? routes.prefix : undefined;
  const prefixPattern = makePrefixPattern(prefix);
  const prefixRouter = express.Router();
  const mockRouter = express.Router();
  prefixRouter.use(prefixPattern, mockRouter);

  // apply mock endpoint handlers.
  if(routes && routes.endpoints){
    for(const endpoint of routes.endpoints){
      switch(endpoint.method){
        case 'GET':
          console.log(`GET    : ${endpoint.pattern}`);
          mockRouter.get(endpoint.pattern, createHnadler(baseDir, endpoint.matches));
          break;
        case 'POST':
          console.log(`POST   : ${endpoint.pattern}`);
          mockRouter.post(endpoint.pattern, createHnadler(baseDir, endpoint.matches));
          break;
        case 'PUT':
          console.log(`PUT    : ${endpoint.pattern}`);
          mockRouter.put(endpoint.pattern, createHnadler(baseDir, endpoint.matches));
          break;
        case 'PATCH':
          console.log(`PATCH  : ${endpoint.pattern}`);
          mockRouter.patch(endpoint.pattern, createHnadler(baseDir, endpoint.matches));
          break;
        case 'DELETE':
          console.log(`DELETE : ${endpoint.pattern}`);
          mockRouter.delete(endpoint.pattern, createHnadler(baseDir, endpoint.matches));
          break;
        default:
          console.error(`error: '${endpoint.method}' is not supported.`);
          throw `'${endpoint.method}' is not supported.`;
      }
    }
  }
  return prefixRouter;
};

const makeRoutesDir = (config: RouterConfig | undefined) => {
  if(config && config.routesPath){
    if(fs.existsSync(config.routesPath)){
      const stat = fs.statSync(config.routesPath);
      if(stat.isDirectory()){
        return config.routesPath;
      }else{
        return path.dirname(config.routesPath);
      }
    }
  }
  // default is current directory.
  return '.'
};

// load routes file
const loadRoutes = (config: RouterConfig | undefined) => {
  if(config && config.routesPath){
    if(fs.existsSync(config.routesPath)){
      const stat = fs.statSync(config.routesPath);
      const routesFileName = stat.isDirectory() 
                           ? `${config.routesPath}/${DEFAULT_ROUTES_FILE}`
                           : config.routesPath;
      const rawRoutes = fs.readFileSync(routesFileName);
      const routes = JSON.parse(rawRoutes.toString()) as Routes;
      return routes;
    }
  }
  return undefined;
};

// change deector
// detects routes settings (on memory or file).
// change the targetRouter's routes new setting.
const makeChangeDetector = (config: RouterConfig | undefined, routes: Routes | undefined, targetRouter: express.Router) => {
  const changeDetector = (req: express.Request, res: express.Response, next: express.NextFunction) => {



    next();
  };
  // custom function properties
  changeDetector.targetRouter = targetRouter;
  changeDetector.isChanged = false;
  changeDetector.autoApply = false;
  return changeDetector;
};

/// making a router from difinition file.
export const mockRouter = (config?: RouterConfig): express.Router => {
  const routes = loadRoutes(config);

  // root router is the entry point.
  const rootRouter = express.Router();
  rootRouter.use(express.urlencoded({extended: true}));
  rootRouter.use(express.json());

  // express-form-data needs temporary directory to upload.
  if(config && config.uploadPath){
    rootRouter.use(form.parse({uploadDir: config.uploadPath, autoClean: true}));
    rootRouter.use(form.union());
  }
 
  // apply middlewares.
  if(config && config.preprocessMiddle){
    if(Array.isArray(config.preprocessMiddle)){
      if(config.preprocessMiddle.length>0){
        for(const middle of config.preprocessMiddle){
          if(typeof middle == 'function'){
            rootRouter.use(middle);
          }
        }
      }
    }else{
      rootRouter.use(config.preprocessMiddle);
    }   
  }

  // prefix router is mocking root.
  const routesDir = makeRoutesDir(config);
  const prefixRouter = makePrefixRouter(routesDir, routes);

  // thunk router is the target of change detector.
  const thunkRouter = express.Router();
  thunkRouter.use(prefixRouter);

  // apply change detector.
  const changeDetector = makeChangeDetector(config, routes, thunkRouter);
  rootRouter.use(changeDetector);

  // apply thunk router.
  rootRouter.use(thunkRouter);

  return rootRouter;
};

