import express from 'express';
import { Config, loadConfig } from './configurations';
import cmd from 'commander';

cmd
  .version('0.0.1', '-v --version')
  .usage('[options]')
  .option('-c --config [fileName]', 'configuration file name')
  .option('-p --port [portNo]', 'listen port number', parseInt)
  .option('-d --data [directory]', 'data directory')
  .option('-s --static [directory]', 'static contents directory')
  .option('-a --apiBaseUri [uri]', 'control api base uri')
  .parse(process.argv);

const config = loadConfig(cmd.config);
const finalConfig: Config = {
  port: cmd.port || config.port,
  dataDirectory: cmd.data || config.dataDirectory,
  staticContents: cmd.static || config.staticContents,
  apiRoot: cmd.apiBaseUri || config.apiRoot,
};

const app = express();

// serve static contents
app.use(express.static(finalConfig.staticContents))

// starting to serve
app.listen(finalConfig.port, ()=>{
  console.log(`started on port ${finalConfig.port}`);
});
