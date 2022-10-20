/// <reference types="node" />
import express from "express";
import { IncomingHttpHeaders } from "http";
import { Record, Routes } from "common";
export declare const DEFAULT_ROUTES_FILE = "routes.json";
export declare type RouterConfig = {
    routesPath?: string;
    apiRoot?: string;
    uploadPath?: string;
    preprocessMiddle?: express.Handler[] | express.Handler;
    enableCors?: boolean;
};
export declare type RequestSummary = {
    data: Record<any>;
    headers: IncomingHttpHeaders;
    cookies: Record<any>;
};
export declare type ResponseSummary = {
    status: number;
    data?: Record<any>;
    headers: Record<any>;
    cookies: Record<any>;
    rawData?: any;
};
export declare type XMLRequest = express.Request & {
    xml?: any;
};
export declare type ChangeDetector = {
    targetRouter: express.Router;
    routesFileName?: string;
    routesTimestamp?: number;
    routesDir: string;
    routes: Routes;
    isChanged?: boolean;
} & express.RequestHandler;
export declare type EndpointsChangeDetector = {
    targetRouter: express.Router;
    endpointsFileName: string;
    endpointsTimestamp: number;
    endpointsDir: string;
    defaultScript?: string;
    suppressContentLength?: boolean;
} & express.RequestHandler;
export declare type ResponseModifier = (request: RequestSummary, response: ResponseSummary, state: Record<any>) => void;
