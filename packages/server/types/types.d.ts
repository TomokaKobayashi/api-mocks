/// <reference types="node" />
import express from "express";
import { IncomingHttpHeaders } from "http";
import { Record, Routes } from "common";
export declare const DEFAULT_ROUTES_FILE = "routes.json";
export type RouterConfig = {
    routesPath?: string;
    apiRoot?: string;
    uploadPath?: string;
    preprocessMiddle?: express.Handler[] | express.Handler;
    enableCors?: boolean;
};
export type RequestSummary = {
    data: Record<any>;
    headers: IncomingHttpHeaders;
    cookies: Record<any>;
};
export type ResponseSummary = {
    status: number;
    data?: Record<any>;
    headers: Record<any>;
    cookies: Record<any>;
    rawData?: any;
};
export type XMLRequest = express.Request & {
    xml?: any;
};
export type ChangeDetector = {
    targetRouter: express.Router;
    routesFileName?: string;
    routesTimestamp?: number;
    routesDir: string;
    routes: Routes;
    isChanged?: boolean;
} & express.RequestHandler;
export type EndpointsChangeDetector = {
    targetRouter: express.Router;
    endpointsFileName: string;
    endpointsTimestamp: number;
    endpointsDir: string;
    defaultScript?: string;
    suppressContentLength?: boolean;
} & express.RequestHandler;
export type ResponseModifier = (request: RequestSummary, response: ResponseSummary, state: Record<any>) => void;
