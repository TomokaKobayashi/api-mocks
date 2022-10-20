import express from "express";
import commander from "commander";
import path from "path";
import fs from "fs";
import { DataType, Endpoint, Metadata, Pattern, Routes, Record, INNER_ENDPOINTS } from "common";
import { v4 } from "uuid";
import { findFiles } from "./utils";

// model of data
type DataModel = {
  path?: string;
  dataType: DataType;
  rawData?: string;
  objectData?: any;
};

// model of metadata
type MetadataModel = Omit<Metadata, "data" | "datatype"> & {
  data?: DataModel;
};

// model of match
type MatchModel = Omit<Pattern, "metadata"> & {
  metadata: MetadataModel;
};

// model of endpoint
type EndpointModel = Omit<Endpoint, "matches"> & {
  matches: MatchModel[];
};

// model of endpoints.json
type EndpointsModel = {
  path: string;
  endpoints: EndpointModel[];
};

// model of routes.json
type RoutesModel = Omit<Routes, "endpoints"> & {
  endpoints: EndpointsModel[];
  basePath: string;
};

// data to manipulate
let target: RoutesModel;

// expand data
const expandData = (
  basePath: string,
  dataType: DataType | undefined,
  data: string | Record<any> | undefined
): DataModel | undefined => {
  if(dataType==='object'){
    return {
      dataType,
      objectData: data
    };
  }else if(dataType==='value'){
    try{
      const parsed = JSON.parse(data as string);
      return {
        dataType,
        objectData: parsed,
        rawData: data as string
      };
    }catch(e){
      return {
        dataType,
        rawData: data as string
      };
    }
  }else if(dataType==='file'){
    const resolved = path.resolve(basePath, data as string);
    try{
      const rawData = fs.readFileSync(resolved, "utf-8");
      const parsed = JSON.parse(rawData);
      return {
        dataType,
        objectData: parsed,
        path: data as string
      };
    }catch(e){
      return {
        dataType,
        path: data as string
      };
    }   
  }
  return undefined;
};

// expand metadata
const expandMetadata = (
  basePath: string,
  metadata: Metadata
): MetadataModel => {
  const ret: MetadataModel = {
    status: metadata.status,
    headers: metadata.headers,
    cookies: metadata.cookies,
    customProps: metadata.customProps,
    edit: metadata.edit,
    data: expandData(basePath, metadata.datatype, metadata.data),
  };
  return ret;
};

// load metadata
const loadMetadata = (
  basePath: string,
  metadataPath: string
): MetadataModel => {
  const metadataResolved = path.resolve(basePath, metadataPath);
  const metadataDir = path.dirname(metadataResolved);
  const rawMetadata = fs.readFileSync(metadataResolved, "utf-8");
  const metadata = JSON.parse(rawMetadata) as Metadata;
  return expandMetadata(metadataDir, metadata);
};

// expand match
const expandMatch = (basePath: string, match: Pattern) => {
  const model: MatchModel = {
    conditions: match.conditions,
    metadataType: match.metadataType,
    customProps: match.customProps,
    metadata:
      match.metadataType === "file"
        ? loadMetadata(basePath, match.metadata as string)
        : expandMetadata(basePath, match.metadata as Metadata),
  };
  return model;
};

// expand endpoints
const expandEndpoints = (
  basePath: string,
  endpointsPath: string,
  endpoints: Endpoint[]
) => {
  const ret: EndpointsModel = {
    path: endpointsPath,
    endpoints: [],
  };
  if(!endpoints) return ret;
  for (const endpoint of endpoints) {
    const model: EndpointModel = {
      pattern: endpoint.pattern,
      method: endpoint.method,
      matches: [],
      name: endpoint.name,
      id: endpoint.id || v4(),
      source: endpoint.source,
      customProps: endpoint.customProps,
      validatorArgs: endpoint.validatorArgs,
      disabled: endpoint.disabled,
    };
    // expand matches
    for (const match of endpoint.matches) {
      const matchModel = expandMatch(basePath, match);
      model.matches.push(matchModel);
    }
  }

  return ret;
};

const loadEndpoints = (basePath: string, endpointPath: string): EndpointsModel => {
  const resolved = path.resolve(basePath, endpointPath);
  if(!fs.existsSync(resolved)){
    return {
      path: resolved,
      endpoints: []
    };
  }
  const endpointsDir = path.dirname(resolved);
  const rawEndpoints = fs.readFileSync(resolved, "utf-8");
  const parent = JSON.parse(rawEndpoints);
  if(!parent.endpoints){
    return {
      path: resolved,
      endpoints: []
    };
  }
  return expandEndpoints(endpointsDir, endpointPath, parent.endpoints as Endpoint[]);
};

// read routes
const readRoutes = (fileName: string): RoutesModel => {
  // is exist?
  const exists = fs.existsSync(fileName);
  if (!exists) {
    // create new empty routes.
    return {
      basePath: path.dirname(fileName),
      endpoints: [
        {
          path: INNER_ENDPOINTS,
          endpoints: [],
        },
      ],
    };
  }

  // decide filepath and dirname.
  const stat = fs.statSync(fileName);
  const isDir = stat.isDirectory();
  const routesFile = isDir ? path.join(fileName, "routes.json") : fileName;
  const routesDir = isDir ? fileName : path.dirname(fileName);

  // read and parse
  const rawData = fs.readFileSync(routesFile, "utf-8");
  // parse
  const rawRoutes = JSON.parse(rawData) as Routes;
  // construct routes
  const routes: RoutesModel = {
    basePath: routesDir,
    prefix: rawRoutes.prefix,
    defaultHeaders: rawRoutes.defaultHeaders,
    suppressHeaders: rawRoutes.suppressHeaders,
    scripts: rawRoutes.scripts,
    defaultScript: rawRoutes.defaultScript,
    endpointsType: rawRoutes.endpointsType,
    endpointsPath: rawRoutes.endpointsPath,
    endpoints: [],
    customProps: rawRoutes.customProps,
    version: rawRoutes.version,
  };
  // expand endpoints
  if (!rawRoutes.endpointsType || rawRoutes.endpointsType === "immediate") {
    const ep = expandEndpoints(routesDir, INNER_ENDPOINTS, rawRoutes.endpoints);
    if(ep) routes.endpoints.push(ep);
  } else if (rawRoutes.endpointsType === "file" && rawRoutes.endpointsPath) {
    const ep = loadEndpoints(routesDir, rawRoutes.endpointsPath)
    if(ep) routes.endpoints.push(ep);
  } else if (rawRoutes.endpointsType === "dir" && rawRoutes.endpointsPath) {
    const stat = fs.statSync(rawRoutes.endpointsPath);
    if(stat.isDirectory()){
      const files = findFiles(rawRoutes.endpointsPath, /^.+\.json$/);
      if(files){
        for(const file of files){
          const dirName = path.dirname(file);
          const fileName = path.basename(file);
          const ep = loadEndpoints(dirName, fileName);
          if(ep) routes.endpoints.push(ep);
        }
      }
    }
  }

  return routes;
};

// save routes
const saveRoutes = (fileName: string, routes: RoutesModel) => {};

// parsing parameters.
commander
  .version("0.0.1", "-v --version")
  .usage("[options]")
  .option("-p --port <portNo>", "listen port number", parseInt)
  .option("-r --routes <directory>", "routes directory")
  .parse(process.argv);

// port number.
const port = commander.getOptionValue("port") || 4020;
const routes = commander.getOptionValue("routes");
if (!routes) {
  console.error("ERROR!!! : -r or --routes is required.");
  process.exit(1);
}

// initialze this app.
target = readRoutes(routes);

// create app
const app = express();

// static contents for gui
const publicDir = path.resolve(module.path, "../public");
console.log(`gui dir = ${publicDir}`);
const statHandler = express.static(publicDir);
const pubRouter = express.Router();
pubRouter.use("/gui", statHandler);
app.use(pubRouter);

// api endpoints
const apiRouter = express.Router();

app.use("/api", apiRouter);

// starting to serve
app.listen(port, () => {
  console.log(`started on port ${port}`);
});
