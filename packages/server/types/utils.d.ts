import express from "express";
import { Metadata, RequestSummary, Record } from "./types";
export declare const getState: () => Record<any>;
export declare const setState: (st: any) => void;
export declare const evaluateConditions: (req: RequestSummary, conditions?: string | undefined) => boolean;
export declare const processMetadata: (basePath: string, metadata: Metadata, defaultScript: string | undefined, req: RequestSummary, res: express.Response) => void;
export declare const loadMetadata: (baseDir: string, filePath: string) => {
    metadata: Metadata;
    baseDir: string;
};
