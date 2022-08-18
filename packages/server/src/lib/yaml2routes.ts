import fs from 'fs';
import { makeEndpointsFromYaml } from './make-endpoints';
import commander from "commander";
import { Endpoint } from './types';

commander
  .version("0.0.1", "-v --version")
  .usage("[options]")
  .option("-i --input <fileName | dirName>", "input file or directory name(required)")
  .option("-p --prefix <prefix>", "response data file prefix")
  .option("-v --with-validation", "enable to output validation parameters")
  .parse(process.argv);

const options = commander.opts();
const input = options.input as string;
const prefix = options.prefix as string;
const withValidation = options.withValidation as boolean;

if(!input){
  console.log('ERROR: input is required.');
  process.exit(1);
}
if(!fs.existsSync(input)){
  console.log('ERROR: input does not exist.');
  process.exit(1);
}
// input is file or dir?
const stat = fs.statSync(input);
const dirFlag = stat.isDirectory();
const targets: string[] = [];
const yamlPat = /^.+.\ya?ml$/;
const yamlPat2 = /^all.\ya?ml$/;
if(dirFlag){
  // directory
  const dir = fs.readdirSync(input);
  const temp: string[] = [];
  for(const ent of dir){
    if(yamlPat.test(ent)){
      if(yamlPat2.test(ent)){
        // if 'all.yaml' exists, process only 'all.yaml'.
        targets.push(ent);
        break;
      }
      temp.push(ent);
    }
    if(targets.length==0){
      // 'all.yaml does not exist.
      targets.push(...temp);
    }
  }
}else{
  // only single file
  targets.push(input);
}

// read and process yaml(s)
const endpoints: Endpoint[] = [];
for(const target of targets){
  try{
    const content = fs.readFileSync(target, 'utf-8');
    const endpoint = makeEndpointsFromYaml(content, target);
    endpoints.push(...endpoint);
  }catch(err){
    console.error(`ERROR: file:'${target} can not be processed.`);
    console.error(err);
  }
}

// output routes.json
