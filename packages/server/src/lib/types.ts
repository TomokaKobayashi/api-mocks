// COPYRIGHT 2021 Kobayashi, Tomoka
import express from "express";
import { IncomingHttpHeaders } from "http";
import { Record, Routes } from "common";

// default routes file name.
export const DEFAULT_ROUTES_FILE = "routes.json";

export type RouterConfig = {
  // the path to 'routes.json'.
  routesPath?: string;
  // controlling api's root path of this mock server
  apiRoot?: string;
  // temporary directory is used when file upload.
  uploadPath?: string;
  // preprocess middles run before handler
  preprocessMiddle?: express.Handler[] | express.Handler;
  // enable CORS headers and preflight request(OPTION).
  enableCors?: boolean;
  // Access-Control-Allow-Headers in CORS
  allowHeaders?: string;
  // Max receive size
  maxReceiveSize?: string;
  // Keep Upload Files
  keepUploadFile?: boolean;
};

// request data is use to evaluate condiitons of matching.
export type RequestSummary = {
  // data from body, params and query of req.
  data: Record<any>;
  // headers form headers of req.
  headers: IncomingHttpHeaders;
  // cookies
  cookies: Record<any>;
};

// respose data is use to edit response.
export type ResponseSummary = {
  // response status
  status: number;
  // response data body (only JSON).
  data?: Record<any>;
  // response headers
  headers: Record<any>;
  // response cookies
  cookies: Record<any>;
  // row response data
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

export type ResponseModifier = (
  request: RequestSummary,
  response: ResponseSummary,
  state: Record<any>
) => void;
