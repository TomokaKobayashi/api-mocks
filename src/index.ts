import express from 'express';
import { Config, loadConfig } from './configurations';
import cmd from 'commander';
import defConfig from './config/default.json';

cmd
  .version('0.0.1', '-v --version')
  .usage('[options]')
  .option('-c --config [fileName]', 'configuration file name')
  .option('-p --port [portNo]', 'listen port number', parseInt)
  .option('-d --data [directory]', 'data directory')
  .option('-s --static [directory]', 'static contents directory')
  .option('-a --apiBaseUri [uri]', 'control api base uri')
  .parse(process.argv);

const config = cmd.config ? loadConfig(cmd.config) : {};
const finalConfig: Config = {
  port: cmd.port || config.port || defConfig.port,
  dataDirectory: cmd.data || config.dataDirectory || defConfig.dataDirectory,
  staticContents: cmd.static || config.staticContents || defConfig.staticContents,
  apiRoot: cmd.apiBaseUri || config.apiRoot || defConfig.apiRoot,
};


const app = express();

app.get('/', (req, res) => {
  res.send('hello!!!');
});

app.listen(finalConfig.port, ()=>{
  console.log(`start on port ${finalConfig.port}`);
});
