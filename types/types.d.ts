/// <reference types="node" />
import express from "express";
import { IncomingHttpHeaders } from "http";
export interface Record<T> {
    [key: string]: T;
}
export declare type Header = {
    name: string;
    value: string;
};
export declare type Metadata = {
    status?: number;
    headers?: Header[];
    cookies?: Header[];
    datatype?: 'file' | 'value' | 'object';
    data?: string | Record<any>;
    edit?: string;
};
export declare type Pattern = {
    conditions?: string;
    metadataType?: 'file' | 'immidiate';
    metadata: string | Metadata;
};
export declare type Endpoint = {
    pattern: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    matches: Pattern[];
    name?: string;
    id?: string;
    source?: string;
};
export declare type Routes = {
    prefix: string[] | string;
    defaultHeaders?: Header[];
    defaultScript?: string;
    endpoints: Endpoint[];
};
export declare const DEFAULT_ROUTES_FILE = "routes.json";
export declare type RouterConfig = {
    routesPath?: string;
    apiRoot?: string;
    uploadPath?: string;
    preprocessMiddle?: express.Handler[] | express.Handler;
    needRoutesUpdate?: boolean;
};
export declare type RequestSummary = {
    data: Record<any>;
    headers: IncomingHttpHeaders;
    cookies: Record<any>;
};
export declare type ChangeDetector = {
    targetRouter: express.Router;
    routesFileName?: string;
    routesTimestamp?: number;
    routesDir: string;
    routes?: Routes;
    isChanged?: boolean;
    needsUpdateFile?: boolean;
} & express.RequestHandler;
