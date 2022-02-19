import express from "express";
import { Metadata, RequestSummary } from "./types";
export declare const evaluateConditions: (req: RequestSummary, conditions?: string | undefined) => boolean;
export declare const processMetadata: (basePath: string, metadata: Metadata, defaultScript: string | undefined, req: RequestSummary, res: express.Response) => void;
export declare const loadMetadata: (baseDir: string, filePath: string) => {
    metadata: Metadata;
    baseDir: string;
};
