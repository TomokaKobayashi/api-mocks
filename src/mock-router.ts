import express from 'express';
import fs from 'fs';
import path from 'path';
import form from 'express-form-data';

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

const evaluateConditions = (req: express.Request, conditions?: Condition[][]): boolean => {
  if(!conditions) return true;
  for(const andConditions of conditions){
    for(const condition of andConditions){

    }
  }
  return false;
}

const createProcessor = (baseDir: string, patterns: Pattern[]) => {
  return (req: Request, res: express.Response, next: express.NextFunction) => {
    console.log(`requested url = ${req.url}`);
    console.log(`requested method = ${req.method}`);
    console.log(`requested query params = ${JSON.stringify(req.query, null, '  ')}`);
    console.log(`requested params = ${JSON.stringify(req.params, null, '  ')}`);
    console.log(`requested headers = ${JSON.stringify(req.headers, null, '  ')}`);
    console.log(`requested body = ${JSON.stringify(req.body, null, '  ')}`);
    console.log(`requested files = ${JSON.stringify(req.files, null, '  ')}`);
    let proceed = false;
    for(const pat of patterns){
      if(evaluateConditions(req, pat.conditions)){
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

/// 定義情報からrouterを作成する関数です。
export const mockRouter = (config: RouterConfig): express.Router => {
  const rawRoute = fs.readFileSync(config.dataDirectory + '/routes.json');
  const routes = JSON.parse(rawRoute.toString()) as Routes;
  const prefixes = Array.isArray(routes.prefixes) ? routes.prefixes : [routes.prefixes];
  const prefixPattern = new RegExp(`(${prefixes.join('|')})`);
  const rootRouter = express.Router();
  rootRouter.use(express.urlencoded({extended: true}));
  rootRouter.use(express.json());
  rootRouter.use(form.parse({uploadDir: config.uploadPath, autoClean: true}));
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

