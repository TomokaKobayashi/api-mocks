import fs from 'fs';
import path from 'path';
import { makeEndpointsFromYaml } from './make-endpoints';
import commander from "commander";
import { Endpoint, Metadata, Yaml2RoutesExtraConfig } from 'common';
import { findFiles } from './utils';

const yamlPat = /^.+\.ya?ml$/;

const defaultConfigFile = 'yaml2routes.config.js';
const defaultConfig: Yaml2RoutesExtraConfig = {
  requiredStting: []
};
const tryReadConfig = (fileName: string = defaultConfigFile) => {
  try{
    if(fs.existsSync(fileName)){
      const stat = fs.statSync(fileName);
      if(stat.isFile()){
        const fullPath = path.resolve(fileName);
        const config = require(fullPath);
        return config.default;
      }
    }
  }catch(error){
    console.log(`ERROR: an error occurred in reading '${fileName}'`);
    console.log(error);
    console.log('continue...');
  }

  return defaultConfig;
};


commander
  .version("0.0.1", "-v --version")
  .usage("[options]")
  .option("-i --input <fileName | dirName>", "input file or directory name(required)")
  .option("-o --output <fileName>", "output file name for routes.json(default: 'routes.json'")
  .option("-p --prefix <prefix>", "response data file prefix")
  .option("-r --required-only <level>", "output only 'required' data", parseInt)
  .option("-s --stereo-type <fileName>", "prototype of output routes.json")
  .option("-w --with-validation", "enable to output validation parameters")
  .option("-c --suppress-content-length", "set suppressContentLength flag(omitted)")
  .option("-x --extra-config <fileName>", "read extra configuration file")
  .parse(process.argv);

const options = commander.opts();
const input = options.input as string;
const prefix = options.prefix as string;
const output = options.output as string || 'routes.json';
const withValidation = options.withValidation as boolean;
const stereoTypeFile = options.stereoType;
const requiredOnly = options.requiredOnly as number;
const extraConfig = options.extraConfig as string;

if(!input){
  console.error('ERROR: input is required.');
  process.exit(1);
}
if(!fs.existsSync(input)){
  console.error('ERROR: input does not exist.');
  process.exit(1);
}
// input is file or dir?
const yamlPat2 = /^.+\/all.\ya?ml$/;
const stat = fs.statSync(input);
const dirFlag = stat.isDirectory();
const targets: string[] = [];
const temp: string[] = [];
if(dirFlag){
  // directory
  const founds = findFiles(input, yamlPat);
  if(founds){
    for(const ent of founds){
      if(yamlPat2.test(ent)){
        targets.push(ent);
        break;
      }
      temp.push(ent);
    }
    if(targets.length==0){
      targets.push(...temp);
    }
  }
}else{
  // only single file
  targets.push(input);
}

// read stereo type
let stereoType = {};
if(stereoTypeFile){
  if(!fs.existsSync(stereoTypeFile)){
    console.error('ERROR: stereoType does not exist.');
    process.exit(1);
  }
  const stat = fs.statSync(stereoTypeFile);
  if(!stat.isFile()){
    console.error('ERROR: stereoType is not file.');
    process.exit(1);
  }
  try{
    stereoType = JSON.parse(fs.readFileSync(stereoTypeFile, 'utf-8'));
  }catch(err){
    console.error('ERROR: can\'t read stereoType.');
    console.error(err);
    process.exit(1);
  }
}
// make outputPath
const dirName = path.dirname(output);

// read extra configuration file
const config = tryReadConfig(extraConfig);

try{
  // read and process yaml(s)
  const endpoints: Endpoint[] = [];
  for(const target of targets){
    try{
      const content = fs.readFileSync(target, 'utf-8');
      const endpoint = makeEndpointsFromYaml(content, target, requiredOnly, config);
      endpoints.push(...endpoint);
    }catch(err){
      console.error(`ERROR: file:'${target}' can not be processed.`);
      console.error(err);
    }
  }

  // if not need validation, delete validation infos.
  if(!withValidation){
    for(const endpoint of endpoints){
      endpoint.validatorArgs = undefined;
    }
  }

  // if prefix option exist, write data files to individual files
  if(prefix){
    let fileIndex = 1;
    endpoints.forEach((endpoint)=>{
      endpoint.matches.forEach(match=>{
        if(match.metadataType ==='immediate'){
          const metaData = match.metadata as Metadata;
          const data = metaData.data;
          if(data){
            const fileName = prefix + fileIndex;
            const fullPath = path.resolve(dirName, fileName);
            fileIndex ++;
            if(metaData.datatype=='object'){
              const outputData = JSON.stringify(data, null, '  ');
              fs.writeFileSync(fullPath, outputData);
              metaData.datatype = 'file';
              metaData.data = fileName;
            }else if(metaData.datatype=='value'){
              const value = data as string;
              try{
                const jsonData = JSON.parse(value);
                fs.writeFileSync(fullPath, JSON.stringify(jsonData, null, '  '));
              }catch(err){
                fs.writeFileSync(fullPath, value);
              }
              metaData.datatype = 'file';
              metaData.data = fileName;
            }
          }
        }
      });
    });
  }else{
    // if datatype is 'value', try to convert 'object'.
    endpoints.forEach((endpoint)=>{
      endpoint.matches.forEach(match=>{
        const metaData = match.metadata as Metadata;
        const data = metaData.data;
        if(data){
          if(metaData.datatype=='value'){
            const value = data as string;
            try{
              const jsonData = JSON.parse(value);
              metaData.datatype = 'object';
              metaData.data = jsonData;
            }catch(err){
              // no action
            }
          }
        }
      });  
    });
  }

  // output routes.json
  const outputData = {...stereoType, endpoints};
  fs.writeFileSync(output, JSON.stringify(outputData, null, '  '));
}catch(error){
  console.error('ERROR: some error occurred!');
  console.log(error);
  process.exit(1);
}
