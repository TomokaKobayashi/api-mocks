import fs from 'fs';
import defConfig from './config/default.json';

export type AppConfig = {
  port: number
  dataDirectory: string
  staticContents: string
  apiRoot: string
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
