"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const commander_1 = __importDefault(require("commander"));
const path_1 = __importDefault(require("path"));
//
// parsing parameters.
commander_1.default
    .version("0.0.1", "-v --version")
    .usage("[options]")
    .option("-p --port <portNo>", "listen port number", parseInt)
    .option("-r --routes <directory>", "routes directory")
    .parse(process.argv);
// port number.
const port = commander_1.default.getOptionValue("port") || 4020;
const routes = commander_1.default.getOptionValue("routes");
if (!routes) {
    console.error("ERROR!!! : -r or --routes is required.");
    process.exit(1);
}
// create app
const app = (0, express_1.default)();
// static contents for gui
const publicDir = path_1.default.resolve(module.path, "../public");
console.log(`gui dir = ${publicDir}`);
const statHandler = express_1.default.static(publicDir);
const pubRouter = express_1.default.Router();
pubRouter.use("/gui", statHandler);
app.use(pubRouter);
// api endpoints
const apiRouter = express_1.default.Router();
app.use("/api", apiRouter);
// starting to serve
app.listen(port, () => {
    console.log(`started on port ${port}`);
});
