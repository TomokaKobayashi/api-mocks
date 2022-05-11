// COPYRIGHT 2021 Kobayashi, Tomoka

// Control APIs
// GET /endpoints
//   returns a list of endpoints as 'endpoints' of Routes structure.
// GET /ednpoint/:id
//   returns an information of an endpoint as Endpoint structure.
// PUT /endpoint/:id (not yet)
//   updates an information of an endpoint by Endpoint stucture.
// POST /endpoint (not yet)
//   adds a new information of an endpoint by Endpoint structure.
// DELETE /endpoint/:id (not yet)
//   removes an information if an endpoint by id.
// GET /response-data/:id/:index (not yet)
//   returns a response data by an id and an index of 'patterns' of Endpoint structure.
// PUT /response-data/:id/:index (not yet)
//   updates a response data by an id and an index of 'patterns' of Endpoint structure.
// POST /endpoints/:name
//   adds endpoints by Open API specification YAML file.
//   and groups these endpoints by name.
// DELETE /endpoints/:name
//   removes a group of endpoints by name.
// POST /debug/endpoints
//   adds endpoints by local Open API specification YAML file path.
//   and groups these endpoints by file path.
// DELETE /debug/endpoints
//   removes a group of endpoints by file path.
// PUT /commit (not yet)
//   saves all changes to files. 
// POST /switch-routes
//   switch the 'routes.json' file.

import express from "express";
import { ChangeDetector, DEFAULT_ROUTES_FILE, Endpoint, Metadata, Pattern, Routes } from "./types";
import { makeEndpointsFromYaml } from "./make-endpoints";
import fs from 'fs';
import { loadMetadata } from "./utils";
import path from "path";
import { getState, setState } from './utils';

const makeSwitchRoutesHandler = (changeDetector: ChangeDetector) => {
  const switchHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const newRoutePath = req.body.routes;
    // check existance of new routes.json
    if(!fs.existsSync(newRoutePath)){
      // not exist
      res.set('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({result: 'error', reason: `'${newRoutePath}' does not exist.`}));
      return;
    }
    // check stat
    const stat = fs.statSync(newRoutePath);
    if(stat.isDirectory()){
      // the path is directory
      changeDetector.routesTimestamp = 0;
      changeDetector.routesFileName = `${newRoutePath}/${DEFAULT_ROUTES_FILE}`;
      changeDetector.routesDir = newRoutePath;
    }else{
      changeDetector.routesTimestamp = 0;
      changeDetector.routesFileName = newRoutePath;
      changeDetector.routesDir = path.dirname(newRoutePath);
    }
    res.set('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify({result: 'success'}));
  };
  return switchHandler;
};

const makeEndpointsListHandler = (changeDetector: ChangeDetector) => {
  const listHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const cdRoutes = changeDetector.routes;
    const retRoute: Routes = {
      prefix: cdRoutes.prefix,
      defaultHeaders: cdRoutes.defaultHeaders ? [...cdRoutes.defaultHeaders] : undefined,
      suppressHeaders: cdRoutes.suppressHeaders ? [...cdRoutes.suppressHeaders] : undefined,
      defaultScript: cdRoutes.defaultScript,
      customProps: cdRoutes.customProps ? {...cdRoutes.customProps} : undefined,
      endpoints: [],
      version: cdRoutes.version,
    };
    for(const endpoint of cdRoutes.endpoints){
      retRoute.endpoints.push({
        pattern: endpoint.pattern,
        method: endpoint.method,
        id: endpoint.id,
        matches: [],
        customProps: endpoint.customProps,
        name: endpoint.name,
      });
    }
    res.set('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(retRoute));
  };
  return listHandler;
};

const makeEndpointDetailHandler = (changeDetector: ChangeDetector) => {
  const detailHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const cdRoutes = changeDetector.routes;
    for(const endpoint of cdRoutes.endpoints){
      if(endpoint.id===req.params.id){
        const matches: Pattern[] = [];
        for(const mt of endpoint.matches){
          let meta = undefined;
          if(mt.metadataType==='immediate'){
            meta = mt.metadata;
          }else if(mt.metadata){
            const m = loadMetadata(changeDetector.routesDir, mt.metadata as string);
            meta = m.metadata;
          } 
          matches.push({
            conditions: mt.conditions,
            metadata: meta ? meta : '',
            customProps: mt.customProps,
          });
        }
        const ret: Endpoint = {
          pattern: endpoint.pattern,
          id: endpoint.id,
          method: endpoint.method,
          customProps: endpoint.customProps,
          matches: matches,
          validatorArgs: endpoint.validatorArgs,
        }
        res.set('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(ret));
      }
    }
    res.status(404).send();
  };
  return detailHandler;
};

// if found same named endpoint, return true and increment count
const incrementSameNameEndpoint = (endpoints: Endpoint[], name: string) => {
  let flag = false;
  if (endpoints && name) {
    for (const endpoint of endpoints) {
      if (endpoint.source === name) {
        flag = true;
        endpoint.count = endpoint.count ? endpoint.count + 1 : 1;
      }
    }
  }
  return flag;
};

// if found same named endpoint , decrement count
// if count is 0, return true
const decrementSameNameEndpoint = (endpoints: Endpoint[], name: string) => {
  let flag = false;
  if (endpoints && name) {
    for (const endpoint of endpoints) {
      if (endpoint.source === name) {
        endpoint.count = endpoint.count ? endpoint.count - 1 : 0;
        if (endpoint.count <= 0) {
          flag = true;
        }
      }
    }
  }
  return flag;
};

const makeAddDebugEndpointHandler = (changeDetector: ChangeDetector) => {
  const addDebugYaml = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (req.body.fileName) {
      if (incrementSameNameEndpoint(addDebugYaml.target.routes.endpoints, req.body.fileName)) {
        // already exists
        console.log(`not added ${req.body.fileName} , already exists`);
        res.status(200).send();
        return;
      }
      const raw = fs.readFileSync(req.body.fileName);
      const endpoints = makeEndpointsFromYaml(raw.toString(), req.body.fileName);
      if (changeDetector.routes) {
        changeDetector.routes.endpoints.push(...endpoints);
        changeDetector.isChanged = true;
      }
      res.status(200).send();
    } else {
      // no content-type can't be accepted.
      res.status(400).send();
    }
  };
  addDebugYaml.target = changeDetector;
  return addDebugYaml;
};

const makeDeleteDebugEndpointHandler = (changeDetector: ChangeDetector) => {
  const removeDebugYaml = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (req.body.fileName) {
      if (!decrementSameNameEndpoint(removeDebugYaml.target.routes.endpoints, req.body.fileName)) {
        res.status(200).send();
        console.log(`not removed ${req.body.fileName} by count`);
        return;
      }
      let flag = false;
      if (removeDebugYaml.target.routes) {
        const newEndpoints = removeDebugYaml.target.routes.endpoints.filter(
          (value) => {
            if (value.source && value.source === req.body.fileName) {
              flag = true;
              return false;
            }
            return true;
          }
        );
        if (flag) {
          console.log(`removed ${req.body.fileName}`);
          removeDebugYaml.target.routes.endpoints = newEndpoints;
          removeDebugYaml.target.isChanged = true;
        } else {
          console.log(`no removal target of ${req.body.fileName}`);
        }
        res.status(200).send();
      }
    } else {
      // no content-type can't be accepted.
      res.status(400).send();
    }
  };
  removeDebugYaml.target = changeDetector;
  return removeDebugYaml;

};

const addEndpointsHandler = (changeDetector: ChangeDetector) => {
  const addYaml = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (incrementSameNameEndpoint(addYaml.target.routes.endpoints, req.params["name"])) {
      // already exists
      console.log(`not added ${req.body.fileName} , already exists`);
      res.status(200).send();
      return;
    }
    const contentType =
      req.headers &&
      req.headers["content-type"] &&
      req.headers["content-type"].split(";");
    if (contentType) {
      if (contentType[0] === "application/yaml") {
        const rawApi = req.body.toString();
        const endpoints = makeEndpointsFromYaml(rawApi, req.params["name"]);
        if (changeDetector.routes) {
          changeDetector.routes.endpoints.push(...endpoints);
          changeDetector.isChanged = true;
        }
        res.status(200).send();
      } else if (contentType[0] === "multipart/form-data") {
        res.status(200).send();
      } else {
        // other content-type can't be accepted.
        res.status(400).send();
      }
    } else {
      // no content-type can't be accepted.
      res.status(400).send();
    }
  };
  addYaml.target = changeDetector;
  return addYaml;
};

const removeEndpointsHandler = (changeDetector: ChangeDetector) => {
  const removeYaml = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const name = req.params["name"];
    if (!decrementSameNameEndpoint(removeYaml.target.routes.endpoints, name)) {
      res.status(200).send();
      console.log(`not removed ${req.body.fileName} by count`);
      return;
    }
    let flag = false;
    const newEndpoints = removeYaml.target.routes.endpoints.filter(
      (value) => {
        if (value.source && value.source === name) {
          flag = true;
          return false;
        }
        return true;
      }
    );
    if (flag) {
      console.log(`removed ${name}`);
      removeYaml.target.routes.endpoints = newEndpoints;
      removeYaml.target.isChanged = true;
    } else {
      console.log(`no removal target of ${name}`);
    }
    res.status(200).send();
  };
  removeYaml.target = changeDetector;
  return removeYaml;
};

const getStateHandler = (
  req: express.Request,
  res: express.Response,
) => {
  res.set('content-type', 'application/json');
  res.status(200).send(JSON.stringify(getState()));
}

export const controlRouter = (
  apiRoot: string,
  changeDetector: ChangeDetector
) => {
  const rootRouter = express.Router();
  const ctrlRouter = express.Router();
  ctrlRouter.get("/endpoints", makeEndpointsListHandler(changeDetector));
  ctrlRouter.get("/endpoints/:id", makeEndpointDetailHandler(changeDetector));
  ctrlRouter.post("/switch-routes", makeSwitchRoutesHandler(changeDetector));
  const router = express.Router();
  router.use(express.raw({ type: "application/yaml" }));
  router.post("/endpoints/:name", addEndpointsHandler(changeDetector));
  router.delete("/endpoints/:name", removeEndpointsHandler(changeDetector));
  const debugRouter = express.Router();
  debugRouter.use(express.json());
  debugRouter.post("/debug/endpoints", makeAddDebugEndpointHandler(changeDetector));
  debugRouter.delete("/debug/endpoints", makeDeleteDebugEndpointHandler(changeDetector));
  const monitorRouter = express.Router();
  monitorRouter.get('/monitor/state', getStateHandler);

  // static contents for gui
  const publicDir = path.resolve(module.path, '../public');
  console.log(`gui dir = ${publicDir}`);
  const statHandler = express.static(publicDir);
  const pubRouter = express.Router();
  pubRouter.use('/gui', statHandler);
  rootRouter.use(apiRoot, ctrlRouter, router, debugRouter, monitorRouter, pubRouter);
  return rootRouter;
};
