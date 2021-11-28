// COPYRIGHT 2021 Kobayashi, Tomoka

import express from 'express';
import { program } from 'commander';
import { mockRouter } from './mock-router';
import fs from 'fs';
import defConfig from './config/default.json';

export type AppConfig = {
  port: number
  routesPath?: string
  staticContents?: string
  apiRoot?: string
  uploadPath?: string
};

export const loadConfig = (path?: string): AppConfig => {
  if(!path) return defConfig;
  try{
    const rawFile = fs.readFileSync(path);
    const config = JSON.parse(rawFile.toString()) as AppConfig;
    return config
  }catch(error){
    console.log('warning: can not read config file : ' + path);
  }
  return defConfig;
};

program
  .version('0.0.1', '-v --version')
  .usage('[options]')
  .option('-c --config [fileName]', 'configuration file name')
  .option('-p --port [portNo]', 'listen port number', parseInt)
  .option('-r --routes [directory]', 'routes directory')
  .option('-s --static [directory]', 'static contents directory')
  .option('-a --apiBaseUri [uri]', 'control api base uri')
  .option('-u --upload [directory]', 'directory for upload')
  .parse(process.argv);

const config = loadConfig(program.getOptionValue('config'));
const finalConfig: AppConfig = {
  port: program.getOptionValue('port') || config.port,
  routesPath: program.getOptionValue('routes') || config.routesPath,
  staticContents: program.getOptionValue('static') || config.staticContents,
  apiRoot: program.getOptionValue('apiBaseUri') || config.apiRoot,
  uploadPath: program.getOptionValue('upload') || config.uploadPath,
};

// a sample middleware to parse JSON in request headers
const sampleMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(`requested url = ${req.url}`);
  console.log(`requested method = ${req.method}`);

  for(const key in req.headers){
    const val = req.headers[key];
    if(val){
      try{
        if(Array.isArray(val)){
          const repVal = [];
          for(const v of val){
            repVal.push(JSON.parse(v));
          }
          req.headers[key] = repVal;
        }else{
          const json = JSON.parse(val);
          req.headers[key] = json;
        }
      }catch(err){
        // no effects
      }
    }
  }

  next();
};

// create app
const app = express();

// create mock-router
const router = mockRouter({
  routesPath: finalConfig.routesPath,
  apiRoot: finalConfig.apiRoot,
  uploadPath: finalConfig.uploadPath,
  preprocessMiddle: sampleMiddleware,
});

// apply mock-router
app.use(router);

// apply static handler
if(finalConfig.staticContents){
  app.use(express.static(finalConfig.staticContents));
}

// starting to serve
app.listen(finalConfig.port, ()=>{
  console.log(`started on port ${finalConfig.port}`);
});
