import express from "express";
import commander from "commander";
import path from "path";

//

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
