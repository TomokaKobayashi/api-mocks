import path from "path";
import fs from 'fs';
import express from "express";
import { Metadata } from "./types";

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
  req: express.Request,
  res: express.Response
) => {
  try {
    if (metadata.headers) {
      for (const header of metadata.headers) {
        res.set(header.name, header.value);
      }
    }
    if (metadata.cookies) {
      for (const cookie of metadata.cookies) {
        res.cookie(cookie.name, cookie.value);
      }
    }
    const respStatus = metadata.status
      ? metadata.status
      : metadata.data
        ? 200
        : 204;
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
        const data = JSON.stringify(metadata.data);
        res.status(respStatus).send(data);
      } else if (metadata.datatype === "value") {
        const data = metadata.data;
        res.status(respStatus).send(data);
      }
    } else {
      console.log("no data");
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
