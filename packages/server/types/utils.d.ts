import express from "express";
import { Metadata } from "./types";
export declare const processMetadata: (basePath: string, metadata: Metadata, req: express.Request, res: express.Response) => void;
export declare const loadMetadata: (baseDir: string, filePath: string) => {
    metadata: Metadata;
    baseDir: string;
};
