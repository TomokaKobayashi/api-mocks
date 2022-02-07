// COPYRIGHT 2021 Kobayashi, Tomoka
import { ResponseModifier } from './types';
import path from 'path';
import fs from 'fs';

type ModifierScript = {
  name: string
  fullName: string
  timeStamp: number
  key: string
  module: any
};

interface ModifierMap{
  [key: string]: ModifierScript
};

type Modifiers = {
  baseDir: string
  modules: ModifierMap
};

const modifiers: Modifiers = {
  baseDir: './',
  modules: {}
};

const findJs = (dir: string): string[] => {
  const ret:string[] = [];
  const d = fs.readdirSync(dir);
  for(const f of d){
    const p = path.resolve(dir, f);
    const s = fs.statSync(p);
    if(s.isDirectory()){
      ret.push(...findJs(p))
    }
    if(f.endsWith('.js')){
      ret.push(p);
    }
  }
  return ret;
}

const loadDynamic = (dir: string, name: string): ModifierScript | undefined => {
  const relName = path.relative(dir, name);
  const stat = fs.statSync(name);
  const key = require.resolve(name);
  const def = require(name);
  return{
    name: relName,
    fullName: name,
    timeStamp: stat.mtime.getTime(),
    key,
    module: def
  }
}

export const loadScripts = (dirName: string) => {
  modifiers.baseDir = dirName;
  const scripts = findJs(dirName);
  for(const s of scripts){
    const module: ModifierScript | undefined = loadDynamic(dirName, s);
    if(module){
      modifiers.modules[module.name] = module;
    }
  }
};

export const getFunction = (moduleName: string, funcName: string): ResponseModifier | undefined => {
  const mod = modifiers.modules[moduleName];
  if(mod){
    const stat = fs.statSync(mod.fullName);
    if(stat.mtime.getTime()!=mod.timeStamp){
      // script is modified
      delete require.cache[mod.key];
      const mod2 = loadDynamic(modifiers.baseDir, mod.fullName);
      if(mod2){
        modifiers.modules[moduleName] = mod2;
        return mod2.module[funcName];
      }else{
        return undefined;
      }
    }
    return mod.module[funcName];
  }
  return undefined;
};