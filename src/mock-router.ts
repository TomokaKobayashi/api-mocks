import express from 'express';
import fs from 'fs';
import path from 'path';

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

const createProcessor = (baseDir: string, patterns: Pattern[]) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log(`requested url = ${req.url}`);
    console.log(`requested params = ${JSON.stringify(req.params, null, '  ')}`);
    let proceed = false;
    for(const pat of patterns){
      if(!pat.conditions){
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
  const router = express.Router();
  rootRouter.use(prefixPattern, router);
  for(const endpoint of routes.endpoints){
    switch(endpoint.method){
      case 'GET':
        router.get(new RegExp(endpoint.pattern), createProcessor(config.dataDirectory, endpoint.matches));
        break;
      case 'POST':
        router.post(new RegExp(endpoint.pattern), createProcessor(config.dataDirectory, endpoint.matches));
        break;
      case 'PUT':
        router.put(new RegExp(endpoint.pattern), createProcessor(config.dataDirectory, endpoint.matches));
        break;
      case 'PATCH':
        router.patch(new RegExp(endpoint.pattern), createProcessor(config.dataDirectory, endpoint.matches));
        break;
      case 'DELETE':
        router.delete(new RegExp(endpoint.pattern), createProcessor(config.dataDirectory, endpoint.matches));
        break;
      default:
        console.error(`error: '${endpoint.method}' is not supported.`);
        throw `'${endpoint.method}' is not supported.`
      }
  }
  return router;
};