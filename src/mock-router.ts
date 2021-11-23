import express from 'express';
import fs from 'fs';
import path from 'path';
import form from 'express-form-data';
import { IncomingHttpHeaders } from 'http';

// JSON -> body
// FORM -> body
// QUERY PARMAS -> query
// PATH PARAMS -> params
// MULTI-PART -> files, body(raw string and content-type is missed)

interface Record<T> {
  [key: string]: T
};

type Request = express.Request & {
  files?: Object
};

type Headers = {
  name: string
  value: string
};

type Definitions = {
  status: number
  headers: Headers[]
  file?: string
  edit?: string
};

type Condition = {
  field: string
  operator: string
  value: string
};

type Pattern = {
  conditions?: Condition[][]
  metadata: string
}

type Endpoint = {
  pattern: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  matches: Pattern[]
  pathParams?: string[]
  name?: string 
};

type Routes = {
  prefixes: string[] | string
  defaultHeaders?: Headers[]
  defaultScript?: string
  endpoints: Endpoint[]
}

type RouterConfig = {
  dataDirectory: string
  apiRoot: string
  uploadPath: string
}

type RequestSummary = {
  data: Record<any>
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

const evaluateConditions = (req: RequestSummary, conditions?: Condition[][]): boolean => {
  if(!conditions) return true;
  for(const andConditions of conditions){
    for(const condition of andConditions){

    }
  }
  return false;
}

/// making a endpoint processor
const createProcessor = (baseDir: string, patterns: Pattern[]) => {
  return (req: Request, res: express.Response, next: express.NextFunction) => {
    console.log(`requested url = ${req.url}`);
    console.log(`requested method = ${req.method}`);

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

/// making a router from difinition file.
export const mockRouter = (config: RouterConfig): express.Router => {
  const rawRoute = fs.readFileSync(config.dataDirectory + '/routes.json');
  const routes = JSON.parse(rawRoute.toString()) as Routes;
  const prefixes = Array.isArray(routes.prefixes) ? routes.prefixes : [routes.prefixes];
  const prefixPattern = new RegExp(`(${prefixes.join('|')})`);
  const rootRouter = express.Router();
  rootRouter.use(express.urlencoded({extended: true}));
  rootRouter.use(express.json());
  rootRouter.use(form.parse({uploadDir: config.uploadPath, autoClean: true}));
  rootRouter.use(form.union());
  const router = express.Router();
  rootRouter.use(prefixPattern, router);

  for(const endpoint of routes.endpoints){
    switch(endpoint.method){
      case 'GET':
        router.get(endpoint.pattern, createProcessor(config.dataDirectory, endpoint.matches));
        break;
      case 'POST':
        router.post(endpoint.pattern, createProcessor(config.dataDirectory, endpoint.matches));
        break;
      case 'PUT':
        router.put(endpoint.pattern, createProcessor(config.dataDirectory, endpoint.matches));
        break;
      case 'PATCH':
        router.patch(endpoint.pattern, createProcessor(config.dataDirectory, endpoint.matches));
        break;
      case 'DELETE':
        router.delete(endpoint.pattern, createProcessor(config.dataDirectory, endpoint.matches));
        break;
      default:
        console.error(`error: '${endpoint.method}' is not supported.`);
        throw `'${endpoint.method}' is not supported.`
      }
  }
  return rootRouter;
};

