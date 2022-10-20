"use strict";
// COPYRIGHT 2021 Kobayashi, Tomoka
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.controlRouter = void 0;
// Control APIs
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
// POST /switch-routes
//   switch the 'routes.json' file.
const express_1 = __importDefault(require("express"));
const types_1 = require("./types");
const make_endpoints_1 = require("./make-endpoints");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
const makeSwitchRoutesHandler = (changeDetector) => {
    const switchHandler = (req, res, next) => {
        const newRoutePath = req.body.routes;
        // check existance of new routes.json
        if (!fs_1.default.existsSync(newRoutePath)) {
            // not exist
            res.set("Content-Type", "application/json");
            res.status(400).send(JSON.stringify({
                result: "error",
                reason: `'${newRoutePath}' does not exist.`,
            }));
            return;
        }
        // check stat
        const stat = fs_1.default.statSync(newRoutePath);
        if (stat.isDirectory()) {
            // the path is directory
            changeDetector.routesTimestamp = 0;
            changeDetector.routesFileName = `${newRoutePath}/${types_1.DEFAULT_ROUTES_FILE}`;
            changeDetector.routesDir = newRoutePath;
        }
        else {
            changeDetector.routesTimestamp = 0;
            changeDetector.routesFileName = newRoutePath;
            changeDetector.routesDir = path_1.default.dirname(newRoutePath);
        }
        res.set("Content-Type", "application/json");
        res.status(200).send(JSON.stringify({ result: "success" }));
    };
    return switchHandler;
};
// if found same named endpoint, return true and increment count
const incrementSameNameEndpoint = (endpoints, name) => {
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
const decrementSameNameEndpoint = (endpoints, name) => {
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
const makeAddDebugEndpointHandler = (changeDetector) => {
    const addDebugYaml = (req, res, next) => {
        if (req.body.fileName) {
            if (incrementSameNameEndpoint(addDebugYaml.target.routes.endpoints, req.body.fileName)) {
                // already exists
                console.log(`not added ${req.body.fileName} , already exists`);
                res.status(200).send();
                return;
            }
            const raw = fs_1.default.readFileSync(req.body.fileName);
            const endpoints = (0, make_endpoints_1.makeEndpointsFromYaml)(raw.toString(), req.body.fileName);
            if (changeDetector.routes) {
                changeDetector.routes.endpoints.push(...endpoints);
                changeDetector.isChanged = true;
            }
            res.status(200).send();
        }
        else {
            // no content-type can't be accepted.
            res.status(400).send();
        }
    };
    addDebugYaml.target = changeDetector;
    return addDebugYaml;
};
const makeDeleteDebugEndpointHandler = (changeDetector) => {
    const removeDebugYaml = (req, res, next) => {
        if (req.body.fileName) {
            if (!decrementSameNameEndpoint(removeDebugYaml.target.routes.endpoints, req.body.fileName)) {
                res.status(200).send();
                console.log(`not removed ${req.body.fileName} by count`);
                return;
            }
            let flag = false;
            if (removeDebugYaml.target.routes) {
                const newEndpoints = removeDebugYaml.target.routes.endpoints.filter((value) => {
                    if (value.source && value.source === req.body.fileName) {
                        flag = true;
                        return false;
                    }
                    return true;
                });
                if (flag) {
                    console.log(`removed ${req.body.fileName}`);
                    removeDebugYaml.target.routes.endpoints = newEndpoints;
                    removeDebugYaml.target.isChanged = true;
                }
                else {
                    console.log(`no removal target of ${req.body.fileName}`);
                }
                res.status(200).send();
            }
        }
        else {
            // no content-type can't be accepted.
            res.status(400).send();
        }
    };
    removeDebugYaml.target = changeDetector;
    return removeDebugYaml;
};
const addEndpointsHandler = (changeDetector) => {
    const addYaml = (req, res, next) => {
        if (incrementSameNameEndpoint(addYaml.target.routes.endpoints, req.params["name"])) {
            // already exists
            console.log(`not added ${req.body.fileName} , already exists`);
            res.status(200).send();
            return;
        }
        const contentType = req.headers &&
            req.headers["content-type"] &&
            req.headers["content-type"].split(";");
        if (contentType) {
            if (contentType[0] === "application/yaml") {
                const rawApi = req.body.toString();
                const endpoints = (0, make_endpoints_1.makeEndpointsFromYaml)(rawApi, req.params["name"]);
                if (changeDetector.routes) {
                    changeDetector.routes.endpoints.push(...endpoints);
                    changeDetector.isChanged = true;
                }
                res.status(200).send();
            }
            else if (contentType[0] === "multipart/form-data") {
                res.status(200).send();
            }
            else {
                // other content-type can't be accepted.
                res.status(400).send();
            }
        }
        else {
            // no content-type can't be accepted.
            res.status(400).send();
        }
    };
    addYaml.target = changeDetector;
    return addYaml;
};
const removeEndpointsHandler = (changeDetector) => {
    const removeYaml = (req, res, next) => {
        const name = req.params["name"];
        if (!decrementSameNameEndpoint(removeYaml.target.routes.endpoints, name)) {
            res.status(200).send();
            console.log(`not removed ${req.body.fileName} by count`);
            return;
        }
        let flag = false;
        const newEndpoints = removeYaml.target.routes.endpoints.filter((value) => {
            if (value.source && value.source === name) {
                flag = true;
                return false;
            }
            return true;
        });
        if (flag) {
            console.log(`removed ${name}`);
            removeYaml.target.routes.endpoints = newEndpoints;
            removeYaml.target.isChanged = true;
        }
        else {
            console.log(`no removal target of ${name}`);
        }
        res.status(200).send();
    };
    removeYaml.target = changeDetector;
    return removeYaml;
};
const getStateHandler = (req, res) => {
    res.set("content-type", "application/json");
    res.status(200).send(JSON.stringify((0, utils_1.getState)()));
};
const controlRouter = (apiRoot, changeDetector) => {
    const rootRouter = express_1.default.Router();
    const ctrlRouter = express_1.default.Router();
    ctrlRouter.post("/switch-routes", makeSwitchRoutesHandler(changeDetector));
    const router = express_1.default.Router();
    router.use(express_1.default.raw({ type: "application/yaml" }));
    router.post("/endpoints/:name", addEndpointsHandler(changeDetector));
    router.delete("/endpoints/:name", removeEndpointsHandler(changeDetector));
    const debugRouter = express_1.default.Router();
    debugRouter.use(express_1.default.json());
    debugRouter.post("/debug/endpoints", makeAddDebugEndpointHandler(changeDetector));
    debugRouter.delete("/debug/endpoints", makeDeleteDebugEndpointHandler(changeDetector));
    const monitorRouter = express_1.default.Router();
    monitorRouter.get("/monitor/state", getStateHandler);
    rootRouter.use(apiRoot, ctrlRouter, router, debugRouter, monitorRouter);
    return rootRouter;
};
exports.controlRouter = controlRouter;
