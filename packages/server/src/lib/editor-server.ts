import express from "express";
import commander from "commander";
import path from "path";
import { DataType, Endpoint, Metadata, Pattern, Routes } from "common";

// model of data
type DataModel = {
  path: string
  dataType: DataType
  rawData: string
  objectData: any
};

// model of metadata
type MetadataModel = Omit<Metadata, "data" | "datatype"> & {
  data: DataModel
};

// model of match
type MatchModel = Omit<Pattern, "metadata"> & {
  metadata: MetadataModel
};

// model of endpoint
type EndpointModel = Omit<Endpoint, "matches"> &
{
  matches: MatchModel[]
};

// model of endpoints.json
type EndpointsModel = {
  path: string
  endpoints: EndpointModel[]
};

// model of routes.json
type RoutesModel = Omit<Routes, "endpoints"> &
{
  endpoints: EndpointsModel[]
}



// read routes.json
const readRoutes = (fileName: string) => {

};

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
