// COPYRIGHT 2021 Kobayashi, Tomoka
import express from "express";
import { IncomingHttpHeaders } from "http";
import { OpenAPIRequestValidatorArgs } from "openapi-request-validator";

// general map string to T.
export interface Record<T> {
  [key: string]: T;
}

// header definition in Metadata.
export type Header = {
  // header name
  name: string;
  // header value
  value: string;
};

// response metadata with status, headers and response data.
export type Metadata = {
  // response status
  status?: number;
  // response headers
  headers?: Header[];
  // set-cookie values
  cookies?: Header[];
  // body data type(default: file)
  datatype?: "file" | "value" | "object";
  // response body data file or immediate value or object
  data?: string | Record<any>;
  // script name in scripts directory
  edit?: string;
  // additional properies
  customProps?: Record<any>;
};

// response pattern definition.
export type Pattern = {
  // condition to use following 'metadata'
  // conditions is written in javascript condition expression.
  // it is evaluated by Function object.
  // like this, 'data.param1===\"AAAA\" || data.param2===\"BBBB\"
  conditions?: string;
  // type of metadata(default: file)
  metadataType?: "file" | "immediate";
  // response metadata file path or Metadata by JSON
  metadata: string | Metadata;
  // additional properies
  customProps?: Record<any>;
};

// endpoint definition
export type Endpoint = {
  // endpoint path pattern string (not RegExp)
  //  basic: /foo/bar
  //  with path parameters: /foo/bar/:para1/:para2
  pattern: string;
  // http method
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  // response definition with conditions
  matches: Pattern[];
  // API name(optional)
  name?: string;
  // endpoint ID
  id?: string;
  // source file
  source?: string;
  // additional properies
  customProps?: Record<any>;
  // validator parameters of openapi-request-validator
  validatorArgs?: OpenAPIRequestValidatorArgs;
  // reference count
  count?: number;
};

// structure definition of 'routers.json'
export type Routes = {
  // endpoint prefix pattern RegExp.
  // `/prefix` of '/prefix/foo/var'.
  // if prefix is Array, matches all of Array.
  // '["/prefix1", "/prefix2"]' is to be '(/prefix1|/prefix2)' .
  prefix?: string[] | string;

  // response headers to apply all responses(exclude error).
  defaultHeaders?: Header[];

  // remove headers from all response.
  suppressHeaders?: string[];

  // scripts directory for editting responses
  scripts?: string;

  // script name in scripts directory to edit all responses(exclude error).
  // it can edit response body when 'Content-Type' is 'application/json'.
  // ** not yet implemented **
  defaultScript?: string;

  // endpoints
  endpoints: Endpoint[];

  // additional properies
  customProps?: Record<any>;

  // file version
  version?: string;

  // suppress content-length header.
  suppressContentLength?: boolean;
};

// default routes file name.
export const DEFAULT_ROUTES_FILE = "routes.json";

export type RouterConfig = {
  // a path to 'routes.json'.
  routesPath?: string;
  // controlling api's root path of this mock server
  apiRoot?: string;
  // a temporary directory is used when file upload.
  uploadPath?: string;
  // preprocess middles run before handler
  preprocessMiddle?: express.Handler[] | express.Handler;
  // needs to update 'routes.json' when the file is modified by control-router.
  needRoutesUpdate?: boolean;
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
  needsUpdateFile?: boolean;
} & express.RequestHandler;

export type ResponseModifier = (request: RequestSummary, response: ResponseSummary, state: Record<any>) => void;
