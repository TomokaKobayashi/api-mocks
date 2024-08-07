"use strict";
// COPYRIGHT 2021 Kobayashi, Tomoka
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const commander_1 = __importDefault(require("commander"));
const mock_router_1 = require("./mock-router");
const fs_1 = __importDefault(require("fs"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const proxy_agent_1 = require("proxy-agent");
const jsonc_parser_1 = require("jsonc-parser");
const devcert_1 = require("@expo/devcert");
const https_1 = __importDefault(require("https"));
const defConfig = {
    port: 4010,
    disabledSettings: ["x-powered-by", "etag"],
    routesPath: "./routes/routes.json",
    staticContents: "./public",
    apiRoot: "/control",
    uploadPath: "./upload",
    staticProxy: {
        secure: false,
        autoRewrite: true,
        protocolRewrite: "http",
        changeOrigin: true,
    },
    enableCors: false,
    maxReceiveSize: "10mb",
    keepUploadFile: false,
};
const loadConfig = (path) => {
    if (!path)
        return defConfig;
    try {
        const rawFile = fs_1.default.readFileSync(path);
        const config = (0, jsonc_parser_1.parse)(rawFile.toString());
        return config;
    }
    catch (error) {
        console.log("warning: can not read config file : " + path);
    }
    return defConfig;
};
const parseDisabledSettings = (headers) => {
    return headers.split(",");
};
const createHttps = (config, app) => __awaiter(void 0, void 0, void 0, function* () {
    const domainName = config.domainName || "localhost";
    const ssl = yield (0, devcert_1.certificateFor)(domainName, { skipCertutilInstall: true, skipHostsFile: true });
    const httpsServer = https_1.default.createServer(ssl, app);
    httpsServer.listen(finalConfig.port, () => {
        console.log(`started https on port ${finalConfig.port} at domain '${domainName}'`);
    });
});
commander_1.default
    .version("0.0.1", "-v --version")
    .usage("[options]")
    .option("-c --config <fileName>", "configuration file name")
    .option("-p --port <portNo>", "listen port number", parseInt)
    .option("-r --routes <directory>", "routes directory")
    .option("-s --static <directory>", "static contents directory")
    .option("-a --apiBaseUri <uri>", "control api base uri")
    .option("-u --upload <directory>", "directory for upload")
    .option("-x --enable-cors", "enable CORS headers and preflight request")
    .option("-y --allow-headers <headers>", "Access-Control-Allow-Headers")
    .option("-m --max-receive-size <size>", "maximum receive body size")
    .option("-t --enable-https", "enable https")
    .option("-w --domain-name", "domain names for https")
    .option("-k --keep-upload-file", "enable https")
    .option("-f --fileUpdate <true|false>", "routes update by control apis", (val) => {
    return val === "true";
})
    .option("-d --disabledSettings <param,...>", "disable express settings", parseDisabledSettings)
    .parse(process.argv);
const config = loadConfig(commander_1.default.getOptionValue("config"));
const finalConfig = {
    port: commander_1.default.getOptionValue("port") || config.port,
    routesPath: commander_1.default.getOptionValue("routes") || config.routesPath,
    staticContents: commander_1.default.getOptionValue("static") || config.staticContents,
    apiRoot: commander_1.default.getOptionValue("apiBaseUri") || config.apiRoot,
    uploadPath: commander_1.default.getOptionValue("upload") || config.uploadPath,
    disabledSettings: commander_1.default.getOptionValue("disabledSettings") || config.disabledSettings,
    staticProxy: config.staticProxy,
    enableCors: commander_1.default.getOptionValue("enableCors") || config.enableCors,
    allowHeaders: commander_1.default.getOptionValue("allowHeaders") || config.allowHeaders,
    maxReceiveSize: commander_1.default.getOptionValue("maxReceiveSize") || config.maxReceiveSize,
    enableHttps: commander_1.default.getOptionValue("enableHttps") || config.enableHttps,
    domainName: commander_1.default.getOptionValue("domainName") || config.domainName,
    keepUploadFile: commander_1.default.getOptionValue("keepUploadFile") || config.keepUploadFile,
};
// a sample middleware to parse JSON in request headers
const sampleMiddleware = (req, res, next) => {
    console.log(`requested url = ${req.url}`);
    console.log(`requested method = ${req.method}`);
    for (const key in req.headers) {
        const val = req.headers[key];
        if (val) {
            try {
                if (Array.isArray(val)) {
                    const repVal = [];
                    for (const v of val) {
                        repVal.push(JSON.parse(v));
                    }
                    req.headers[key] = repVal;
                }
                else {
                    const json = JSON.parse(val);
                    req.headers[key] = json;
                }
            }
            catch (err) {
                // no effects
            }
        }
    }
    next();
};
// create app
const app = (0, express_1.default)();
// apply disabled headers
if (finalConfig.disabledSettings) {
    for (const setting of finalConfig.disabledSettings) {
        console.log("disabled : " + setting);
        app.disable(setting);
    }
}
// create mock-router
const router = (0, mock_router_1.mockRouter)({
    routesPath: finalConfig.routesPath,
    apiRoot: finalConfig.apiRoot,
    uploadPath: finalConfig.uploadPath,
    enableCors: finalConfig.enableCors,
    allowHeaders: finalConfig.allowHeaders,
    maxReceiveSize: finalConfig.maxReceiveSize,
    keepUploadFile: finalConfig.keepUploadFile,
    preprocessMiddle: sampleMiddleware,
});
// apply mock-router
app.use(router);
// apply static handler
const proxyPattern = /https?:\/\//;
if (finalConfig.staticContents) {
    if (proxyPattern.test(finalConfig.staticContents)) {
        app.use((0, http_proxy_middleware_1.createProxyMiddleware)(Object.assign(Object.assign({}, finalConfig.staticProxy), { target: finalConfig.staticContents, agent: new proxy_agent_1.ProxyAgent() })));
    }
    else {
        app.use(express_1.default.static(finalConfig.staticContents));
    }
}
// https key and certification
if (finalConfig.enableHttps) {
    createHttps(finalConfig, app);
}
else {
    // starting to serve
    app.listen(finalConfig.port, () => {
        console.log(`started http on port ${finalConfig.port}`);
    });
}
