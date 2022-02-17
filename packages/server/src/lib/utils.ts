// COPYRIGHT 2021 Kobayashi, Tomoka
import path from "path";
import fs from 'fs';
import express from "express";
import { Metadata, RequestSummary, ResponseSummary, Record } from "./types";
import { getFunction } from "./response-modifier";

// state Object
const state: Record<any> = {};

// request summary memo:
// JSON -> body -> data
// FORM -> body -> data
// QUERY PARMAS -> query -> data
// PATH PARAMS -> params -> data
// MULTI-PART -> body(raw string and content-type is missed) -> data
// HEADERS -> headers -> headers
// COOKIES -> cookies -> cookies

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
        headers[header.name] = header.value;
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
    }
    
    if (metadata.data) {
      if (!metadata.datatype || metadata.datatype === "file") {
        const dataFileName = metadata.data as string;
        const dataPath = path.isAbsolute(dataFileName)
          ? dataFileName
          : basePath + "/" + dataFileName;
        console.log("dataPath=" + dataPath);
        const data = fs.readFileSync(dataPath);
        res.status(respStatus).send(data);
      } else if (metadata.datatype === "object") {
        respSummary.data = metadata.data as Record<any>;
      } else if (metadata.datatype === "value") {
        respSummary.rawData = metadata.data;
      }
    }

    // modify response
    if(defaultScript){
      const func = getFunction(defaultScript);
      if(func){
        func(req, respSummary, state);
      }
    }
    if(metadata.edit){
      const func = getFunction(metadata.edit);
      if(func){
        func(req, respSummary, state);
      }
    }
    // set headers
    for(const key in respSummary.headers){
      res.set(key, respSummary.headers[key]);
    }
    // set cookies
    for(const key in respSummary.cookies){
      res.cookie(key, respSummary.cookies[key]);
    }
    if(respSummary.data){
      res.status(respSummary.status).send(JSON.stringify(respSummary.data));
    }if(respSummary.rawData){
      res.status(respSummary.status).send(respSummary.rawData);
    }else{
      res.status(respStatus).send();
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

export const loadMetadata = (baseDir: string, filePath: string): {metadata: Metadata, baseDir: string} => {
  const metadataPath = path.isAbsolute(filePath)
    ? filePath
    : baseDir + "/" + filePath;
  console.log("definitionPath=" + metadataPath);
  const rawDef = fs.readFileSync(metadataPath);
  const metadata = JSON.parse(rawDef.toString()) as Metadata;
  return { metadata, baseDir: path.dirname(metadataPath) };
};
