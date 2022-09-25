// COPYRIGHT 2021 Kobayashi, Tomoka
import path from "path";
import fs from "fs";
import express from "express";
import { Metadata, Record } from "common";
import { RequestSummary, ResponseSummary } from "./types";
import { getFunction } from "./response-modifier";

// state Object
let state: Record<any> = {};
export const getState = () => state;
export const setState = (st: any) => {
  state = { ...state, ...st };
};

// request summary memo:
// JSON -> body -> data
// FORM -> body -> data
// QUERY PARMAS -> query -> data
// PATH PARAMS -> params -> data
// MULTI-PART -> body(raw string and content-type is missed) -> data
// HEADERS -> headers -> headers
// COOKIES -> cookies -> cookies

export const evaluateConditions = (
  req: RequestSummary,
  conditions?: string
): boolean => {
  if (!conditions) return true;
  try {
    const result = new Function(
      "req",
      "state",
      `
      const {data, headers, cookies} = req;
      if(${conditions}) return true;
      return false;
      `
    )(req, state);
    return result;
  } catch (error) {
    console.log("*** condition parse error ***");
    console.log(conditions);
    console.log(error);
  }
  return false;
};

export const processMetadata = (
  basePath: string,
  metadata: Metadata,
  defaultScript: string | undefined,
  req: RequestSummary,
  res: express.Response
) => {
  try {
    const headers: Record<any> = {};
    if (metadata.headers) {
      for (const header of metadata.headers) {
        headers[header.name.toLowerCase()] = header.value;
      }
    }

    const cookies: Record<any> = {};
    if (metadata.cookies) {
      for (const cookie of metadata.cookies) {
        cookies[cookie.name] = cookie.value;
      }
    }

    const respStatus = metadata.status
      ? metadata.status
      : metadata.data
      ? 200
      : 204;

    const respSummary: ResponseSummary = {
      status: respStatus,
      headers,
      cookies,
    };

    if (metadata.data) {
      if (!metadata.datatype || metadata.datatype === "file") {
        const dataFileName = metadata.data as string;
        const dataPath = path.isAbsolute(dataFileName)
          ? dataFileName
          : basePath + "/" + dataFileName;
        console.log("dataPath=" + dataPath);
        const data = fs.readFileSync(dataPath);
        if (
          headers["content-type"] &&
          headers["content-type"].indexOf("application/json") >= 0
        ) {
          respSummary.data = JSON.parse(data.toString());
        } else {
          respSummary.rawData = data;
        }
      } else if (metadata.datatype === "object") {
        respSummary.data = metadata.data as Record<any>;
      } else if (metadata.datatype === "value") {
        respSummary.rawData = metadata.data;
      }
    }

    // modify response
    if (defaultScript) {
      const func = getFunction(defaultScript);
      if (func) {
        func(req, respSummary, state);
      }
    }
    if (metadata.edit) {
      const func = getFunction(metadata.edit);
      if (func) {
        func(req, respSummary, state);
      }
    }
    // set headers
    for (const key in respSummary.headers) {
      res.set(key, respSummary.headers[key]);
    }
    // set cookies
    for (const key in respSummary.cookies) {
      res.cookie(key, respSummary.cookies[key]);
    }
    if (respSummary.data) {
      res
        .status(respSummary.status)
        .write(JSON.stringify(respSummary.data), () => res.send());
    }
    if (respSummary.rawData) {
      res
        .status(respSummary.status)
        .write(respSummary.rawData, () => res.send());
    } else {
      res.status(respStatus).send();
    }
  } catch (error) {
    console.log(error);
    res.status(500).write(error, () => res.send());
  }
};

export const loadMetadata = (
  baseDir: string,
  filePath: string
): { metadata: Metadata; baseDir: string } => {
  const metadataPath = path.isAbsolute(filePath)
    ? filePath
    : baseDir + "/" + filePath;
  console.log("definitionPath=" + metadataPath);
  const rawDef = fs.readFileSync(metadataPath);
  const metadata = JSON.parse(rawDef.toString()) as Metadata;
  return { metadata, baseDir: path.dirname(metadataPath) };
};

export const findFiles = (dirName: string, pattern: RegExp): string[] | undefined=> {
  const ret: string[] = [];
  const dir = fs.readdirSync(dirName);
  for(const file of dir){
    const filePath = path.join(dirName, file);
    if(pattern.test(file)){
      ret.push(filePath);
    }else{
      const stat = fs.statSync(filePath);
      if(stat.isDirectory()){
        const children = findFiles(filePath, pattern);
        if(children) ret.push(...children);
      }
    }
  }
  if(ret.length==0) return undefined;
  return ret;
};
