"use strict";
// COPYRIGHT 2021 Kobayashi, Tomoka
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.controlRouter = void 0;
// Control APIs
// GET /endpoints
//   returns a list of endpoints as 'endpoints' of Routes structure.
// GET /ednpoint/:id
//   returns an information of an endpoint as Endpoint structure.
// PUT /endpoint/:id
//   updates an information of an endpoint by Endpoint stucture.
// POST /endpoint
//   adds a new information of an endpoint by Endpoint structure.
// DELETE /endpoint/:id
//   removes an information if an endpoint by id.
// GET /response-data/:id/:index
//   returns a response data by an id and an index of 'patterns' of Endpoint structure.
// PUT /response-data/:id/:index
//   updates a response data by an id and an index of 'patterns' of Endpoint structure.
// POST /endpoints/:name
//   adds endpoints by Open API specification YAML file.
//   and groups these endpoints and names.
// DELETE /endpoints/:name
//   removes a group of endpoints by name.
const express_1 = __importDefault(require("express"));
const make_endpoints_1 = require("./make-endpoints");
const addEndpointsHandler = (changeDetector) => {
    const addYaml = (req, res, next) => {
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
        if (removeYaml.target.routes) {
            const name = req.params["name"];
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
        }
    };
    removeYaml.target = changeDetector;
    return removeYaml;
};
const controlRouter = (apiRoot, changeDetector) => {
    const rootRouter = express_1.default.Router();
    const router = express_1.default.Router();
    router.use(express_1.default.raw({ type: "application/yaml" }));
    router.use(express_1.default.json());
    router.post("/endpoints/:name", addEndpointsHandler(changeDetector));
    router.delete("/endpoints/:name", removeEndpointsHandler(changeDetector));
    rootRouter.use(apiRoot, router);
    return rootRouter;
};
exports.controlRouter = controlRouter;
