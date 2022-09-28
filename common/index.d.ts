/// <reference types='node' />
import { OpenAPIRequestValidatorArgs } from "openapi-request-validator";

// general map string to T.
export interface Record<T> {
  [key: string]: T;
}
// header definition in Metadata.
export declare type Header = {
  // header name
  name: string;
  // header value
  value: string;
};

// the type of 'data' property.
export declare type DataType = "file" | "value" | "object";

// response metadata with status, headers and response data.
export declare type Metadata = {
  // response status
  status?: number;
  // response headers
  headers?: Header[];
  // set-cookie values
  cookies?: Header[];
  // body data type(default: file)
  datatype?: DataType;
  // response body data file or immediate value or object
  data?: string | Record<any>;
  // script name in scripts directory
  edit?: string;
  // additional properies
  customProps?: Record<any>;
};

// the type of 'metadata'
export declare type MetadataType = "file" | "immediate";

// response pattern definition.
export declare type Pattern = {
  // condition to use following 'metadata'
  // conditions is written in javascript condition expression.
  // it is evaluated by Function object.
  // like this, 'data.param1===\'AAAA\' || data.param2===\'BBBB\'
  conditions?: string;
  // type of metadata(default: file)
  metadataType?: MetadataType;
  // response metadata file path or Metadata by JSON
  metadata: string | Metadata;
  // additional properies
  customProps?: Record<any>;
};

// acceptable HTTP methods
export declare type Methods = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// endpoint definition
export declare type Endpoint = {
  // endpoint path pattern string (not RegExp)
  //  basic: /foo/bar
  //  with path parameters: /foo/bar/:para1/:para2
  pattern: string;
  // http method
  method: Methods;
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
  // disabled this endpoint
  disabled?: boolean;
};

// types of endpoints. default is 'immediate'.
export declare type EndpointsType = "file" | "dir" | "immediate";

// structure definition of 'routers.json'
export declare type Routes = {
  // endpoint prefix pattern RegExp.
  // `/prefix` of '/prefix/foo/var'.
  // if prefix is Array, matches all of Array.
  // '['/prefix1', '/prefix2']' is to be '(/prefix1|/prefix2)' .
  prefix?: string[] | string;

  // response headers to apply all responses(exclude error).
  defaultHeaders?: Header[];

  // remove headers from all response.
  suppressHeaders?: string[];

  // scripts directory for editting responses
  scripts?: string;

  // script name in scripts directory to edit all responses(exclude error).
  // it can edit response body when 'Content-Type' is 'application/json'.
  defaultScript?: string;

  // type of endpoints
  endpointsType?: EndpointsType;

  // path to endpoints file or dir
  endpointsPath?: string;

  // endpoints
  endpoints: Endpoint[];

  // additional properies
  customProps?: Record<any>;

  // file version
  version?: string;
};
