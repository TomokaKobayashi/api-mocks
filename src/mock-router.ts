// COPYRIGHT Kobayashi, Tomoka 2021
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

// type definition to use 'express-form-data'.
// 'express-form-data' make 'files' parameter.
type Request = express.Request & {
  files?: Object
};

type Headers = {
  // header name
  name: string
  // header value
  value: string
};

type Definitions = {
  // response status
  status: number
  // response headers
  headers: Headers[]
  // response data file
  file?: string
  // javascript string to edit response data(only JSON data or headers)
  edit?: string
};

type Pattern = {
  // condition to use following 'metadata'
  // javascript condition expression.
  // be evaluated by Function object.
  // like this, 'data.param1===\"AAAA\" || data.param2===\"BBBB\"
  conditions?: string
  // response metadata file path.
  metadata: string
};

type Endpoint = {
  // endpoint path pattern string (not RegExp)
  // basic: /foo/bar
  // with path parameters: /foo/bar/:para1/:para2
  pattern: string
  // http method
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  // response definition with conditions
  matches: Pattern[]
  // API name(optional)
  name?: string 
};

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

export type RouterConfig = {
  // a directory that 'routes.json' exists.
  dataDirectory: string
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

const processDefiniton = (basePath: string, fileName: string, req: express.Request, res: express.Response) => {
  try{
    const definitionPath = path.isAbsolute(fileName) ? fileName : basePath + '/' + fileName
    console.log('definitionPath=' + definitionPath);
    const rawDef = fs.readFileSync(definitionPath);
    const definition = JSON.parse(rawDef.toString()) as Definitions;
    if(definition.file){
      const dataDir = path.dirname(definitionPath);
      const dataPath = path.isAbsolute(definition.file) ? definition.file : dataDir + '/' + definition.file;
      console.log('dataPath=' + dataPath);
      const data = fs.readFileSync(dataPath);
      for(const header of definition.headers){
        res.set(header.name, header.value);
      }
      res.status(definition.status).send(data);
    }else{
      console.log('no data');
      for(const header of definition.headers){
        res.set(header.name, header.value);
      }
      res.status(definition.status).send();
    }
  }catch(error){
    console.log(error);
    res.status(500).send(error);
  }
}

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
}

/// making a endpoint processor
const createProcessor = (baseDir: string, patterns: Pattern[]) => {
  return (req: Request, res: express.Response, next: express.NextFunction) => {
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
        processDefiniton(baseDir, pat.metadata, req, res);
        break;
      }
    }
    if(!proceed){
      next();
    }
  }
}

const makePrefix = (prefix: string | string[]): string[] => {
  if(!prefix) return ['[^/]*'];
  if(Array.isArray(prefix)){
    if(prefix.length===0){
      return ['[^/]*'];
    }
    return prefix;
  }else{
    return [prefix];
  }
};

/// making a router from difinition file.
export const mockRouter = (config: RouterConfig): express.Router => {
  const rawRoute = fs.readFileSync(config.dataDirectory + '/routes.json');
  const routes = JSON.parse(rawRoute.toString()) as Routes;
  const prefixes = makePrefix(routes.prefix);
  const prefixPattern = new RegExp(`(${prefixes.join('|')})`);
  const rootRouter = express.Router();
  rootRouter.use(express.urlencoded({extended: true}));
  rootRouter.use(express.json());
  rootRouter.use(form.parse({uploadDir: config.uploadPath, autoClean: true}));
  rootRouter.use(form.union());
 
  // preprocessing middlewares
  if(config.preprocessMiddle){
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

  // make handlers from definition
  const router = express.Router();
  rootRouter.use(prefixPattern, router);

  for(const endpoint of routes.endpoints){
    switch(endpoint.method){
      case 'GET':
        console.log(`GET : ${endpoint.pattern}`);
        router.get(endpoint.pattern, createProcessor(config.dataDirectory, endpoint.matches));
        break;
      case 'POST':
        console.log(`POST : ${endpoint.pattern}`);
        router.post(endpoint.pattern, createProcessor(config.dataDirectory, endpoint.matches));
        break;
      case 'PUT':
        console.log(`PUT : ${endpoint.pattern}`);
        router.put(endpoint.pattern, createProcessor(config.dataDirectory, endpoint.matches));
        break;
      case 'PATCH':
        console.log(`PATCH : ${endpoint.pattern}`);
        router.patch(endpoint.pattern, createProcessor(config.dataDirectory, endpoint.matches));
        break;
      case 'DELETE':
        console.log(`DELETE : ${endpoint.pattern}`);
        router.delete(endpoint.pattern, createProcessor(config.dataDirectory, endpoint.matches));
        break;
      default:
        console.error(`error: '${endpoint.method}' is not supported.`);
        throw `'${endpoint.method}' is not supported.`
      }
  }
  return rootRouter;
};

