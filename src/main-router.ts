import express from 'express';
import { Config } from './configurations';
import fs from 'fs';

interface GeneralStringMap {
  [key: string]: string
};

type Definitions = {
  headers: GeneralStringMap
  contentType: string
  responseFile: string
};

type Condition = {
  key: string
  operator: string
  value: string
};

type Pattern = {
  conditions?: Condition[][]
  response: string
}

type Endpoint = {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  patterns: Pattern[]
};

type Routes = {
  baseUrl: string[] | string
  endpoints: Endpoint[]
}

export const loadRoutes = (config: Config): Routes => {
  const rawRoute = fs.readFileSync(config.dataDirectory + '/routes.json');
  const routes = JSON.parse(rawRoute.toString()) as Routes;
  return routes;
}

const createProcessor = (patterns: Pattern[]) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log(`requested url = ${req.url}`);
    next();
  }
}

/// 定義情報からrouterを作成する関数です。
export const createRouter = (routes: Routes): express.Router => {
  const router = express.Router();
  for(const endpoint of routes.endpoints){
    switch(endpoint.method){
      case 'GET':
        router.get(new RegExp(endpoint.path), createProcessor(endpoint.patterns));
        break;
      case 'POST':
        router.post(new RegExp(endpoint.path), createProcessor(endpoint.patterns));
        break;
      case 'PUT':
        router.put(new RegExp(endpoint.path), createProcessor(endpoint.patterns));
        break;
      case 'PATCH':
        router.patch(new RegExp(endpoint.path), createProcessor(endpoint.patterns));
        break;
      case 'DELETE':
        router.delete(new RegExp(endpoint.path), createProcessor(endpoint.patterns));
        break;
      default:
        console.error(`error: '${endpoint.method}' is not supported.`);
        throw `'${endpoint.method}' is not supported.`
      }
  }
  return router;
};