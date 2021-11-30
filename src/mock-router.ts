// COPYRIGHT 2021 Kobayashi, Tomoka

import express from 'express';
import fs from 'fs';
import path from 'path';
import form from 'express-form-data';
import { Metadata, RequestSummary, Pattern, Routes, RouterConfig, DEFAULT_ROUTES_FILE, ChangeDetector } from './types';
import { controlRouter } from './control-router';

// request summary memo:
// JSON -> body -> data
// FORM -> body -> data
// QUERY PARMAS -> query -> data
// PATH PARAMS -> params -> data
// MULTI-PART -> body(raw string and content-type is missed) -> data
// HEADERS -> headers -> headers

const processMetadata = (basePath: string, metadata: Metadata, req: express.Request, res: express.Response) => {
  try{
    if(metadata.headers){
      for(const header of metadata.headers){
        res.set(header.name, header.value);
      }
    }
    if(metadata.cookies){
      for(const cookie of metadata.cookies){
        res.cookie(cookie.name, cookie.value);
      }
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
      cookies: req.cookies,
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
          console.error(`error: method '${endpoint.method}' is not supported.`);
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

const makeRoutesPath = (config: RouterConfig | undefined) => {
  if(config && config.routesPath && fs.existsSync(config.routesPath)){
    const stat = fs.statSync(config.routesPath);
    const routesFileName = stat.isDirectory() 
                         ? `${config.routesPath}/${DEFAULT_ROUTES_FILE}`
                         : config.routesPath;
    return routesFileName;
  }
  return undefined;
}

// load routes file
const loadRoutes = (config: RouterConfig | undefined) => {
  if(config && config.routesPath){
    const routesFileName = makeRoutesPath(config);
    if(routesFileName){
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
  function changeDetector(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (changeDetector.needsUpdateFile && changeDetector.routesFileName) {
      const stat = fs.statSync(changeDetector.routesFileName);
      if (changeDetector.routesTimestamp != stat.mtime.getTime()) {
        console.log('*** ROUTES FILE CHANGE DETECTED ***');
        changeDetector.routesTimestamp = stat.mtime.getTime();
        const rawRoutes = fs.readFileSync(changeDetector.routesFileName);
        const newRoutes = JSON.parse(rawRoutes.toString()) as Routes;
        const prefixRouter = makePrefixRouter(changeDetector.routesDir, newRoutes);
        changeDetector.targetRouter.stack = [];
        changeDetector.targetRouter.use(prefixRouter);
        changeDetector.routes = newRoutes;
        console.log('*** ROUTES IS RECONSTRUCTED ***');
      }
    } else if (changeDetector.isChanged) {
      console.log('*** ROUTES ON MEMORY CHANGE DETECTED ***');
      const prefixRouter = makePrefixRouter(changeDetector.routesDir, changeDetector.routes);
      changeDetector.targetRouter.stack = [];
      changeDetector.targetRouter.use(prefixRouter);
      changeDetector.isChanged = false;
      console.log('*** ROUTES IS RECONSTRUCTED ***');
    }
    next();
  }
  // custom function properties
  const routesFileName = makeRoutesPath(config);
  if(routesFileName){
    const stat = fs.statSync(routesFileName);
    changeDetector.routesFileName = routesFileName;
    changeDetector.routesTimestamp = stat.mtime.getTime();
    changeDetector.routesDir = makeRoutesDir(config);;
  }
  changeDetector.targetRouter = targetRouter;
  changeDetector.routes = routes;
  changeDetector.isChanged = false;
  changeDetector.needsUpdateFile = config && config.needRoutesUpdate;
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

  // create control router.
  if(config?.apiRoot){
    const ctrlRouter = controlRouter(config.apiRoot, changeDetector);
    rootRouter.use(ctrlRouter);
  }

  return rootRouter;
};

