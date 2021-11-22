import express from 'express';
import { AppConfig, loadConfig } from './app-config';
import {program} from 'commander';
import { mockRouter } from './mock-router';

program
  .version('0.0.1', '-v --version')
  .usage('[options]')
  .option('-c --config [fileName]', 'configuration file name')
  .option('-p --port [portNo]', 'listen port number', parseInt)
  .option('-d --data [directory]', 'data directory')
  .option('-s --static [directory]', 'static contents directory')
  .option('-a --apiBaseUri [uri]', 'control api base uri')
  .parse(process.argv);

const config = loadConfig(program.getOptionValue('config'));
const finalConfig: AppConfig = {
  port: program.getOptionValue('port') || config.port,
  dataDirectory: program.getOptionValue('data') || config.dataDirectory,
  staticContents: program.getOptionValue('static') || config.staticContents,
  apiRoot: program.getOptionValue('apiBaseUri') || config.apiRoot,
};

// create mock-router
const router = mockRouter(finalConfig);

// create app
const app = express();

// apply mock-router
app.use(router);
// apply static
app.use(express.static(finalConfig.staticContents));
// starting to serve
app.listen(finalConfig.port, ()=>{
  console.log(`started on port ${finalConfig.port}`);
});
