// COPYRIGHT 2021 Kobayashi, Tomoka

import express from "express";
import commander from "commander";
import { mockRouter } from "./mock-router";
import fs from "fs";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import { ProxyAgent}  from "proxy-agent";
import { parse } from "jsonc-parser";
import { Header } from "common";

export type AppConfig = {
  port: number;
  routesPath?: string;
  disabledSettings?: string[];
  staticContents?: string;
  apiRoot?: string;
  uploadPath?: string;
  staticProxy?: Options;
  enableCors?: boolean;
  allowHeaders?: string;
};

const defConfig: AppConfig = {
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
};

const loadConfig = (path?: string): AppConfig => {
  if (!path) return defConfig;
  try {
    const rawFile = fs.readFileSync(path);
    const config = parse(rawFile.toString()) as AppConfig;
    return config;
  } catch (error) {
    console.log("warning: can not read config file : " + path);
  }
  return defConfig;
};

const parseDisabledSettings = (headers: string) => {
  return headers.split(",");
};

commander
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
  .option(
    "-f --fileUpdate <true|false>",
    "routes update by control apis",
    (val) => {
      return val === "true";
    }
  )
  .option(
    "-d --disabledSettings <param,...>",
    "disable express settings",
    parseDisabledSettings
  )
  .parse(process.argv);

const config = loadConfig(commander.getOptionValue("config"));
const finalConfig: AppConfig = {
  port: commander.getOptionValue("port") || config.port,
  routesPath: commander.getOptionValue("routes") || config.routesPath,
  staticContents: commander.getOptionValue("static") || config.staticContents,
  apiRoot: commander.getOptionValue("apiBaseUri") || config.apiRoot,
  uploadPath: commander.getOptionValue("upload") || config.uploadPath,
  disabledSettings:
    commander.getOptionValue("disabledSettings") || config.disabledSettings,
  staticProxy: config.staticProxy,
  enableCors: commander.getOptionValue("enableCors") || config.enableCors,
  allowHeaders: commander.getOptionValue("allowHeaders") || config.allowHeaders,
};

// a sample middleware to parse JSON in request headers
const sampleMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
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
        } else {
          const json = JSON.parse(val);
          req.headers[key] = json;
        }
      } catch (err) {
        // no effects
      }
    }
  }

  next();
};

// create app
const app = express();

// apply disabled headers
if (finalConfig.disabledSettings) {
  for (const setting of finalConfig.disabledSettings) {
    console.log("disabled : " + setting);
    app.disable(setting);
  }
}

// create mock-router
const router = mockRouter({
  routesPath: finalConfig.routesPath,
  apiRoot: finalConfig.apiRoot,
  uploadPath: finalConfig.uploadPath,
  enableCors: finalConfig.enableCors,
  allowHeaders: finalConfig.allowHeaders,
  preprocessMiddle: sampleMiddleware,
});

// apply mock-router
app.use(router);

// apply static handler
const proxyPattern = /https?:\/\//;
if (finalConfig.staticContents) {
  if (proxyPattern.test(finalConfig.staticContents)) {
    app.use(
      createProxyMiddleware({
        ...finalConfig.staticProxy,
        target: finalConfig.staticContents,
        agent: new ProxyAgent(),
      })
    );
  } else {
    app.use(express.static(finalConfig.staticContents));
  }
}

// starting to serve
app.listen(finalConfig.port, () => {
  console.log(`started on port ${finalConfig.port}`);
});
