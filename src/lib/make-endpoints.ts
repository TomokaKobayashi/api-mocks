// this functions make route info from yaml.
import yaml from "js-yaml";
import { Endpoint, Metadata, Pattern, Header, Record } from "./types";

const resolve = (obj: any, refs: string[]): any => {
  const [car, ...cdr] = refs;
  if (obj[car]) {
    if (cdr && cdr.length > 0) {
      return resolve(obj[car], cdr);
    }
    return obj[car];
  }
  return undefined;
};

// resolve $ref
// should I use dynamic Function object??
const resolveRef = (apiYaml: any, ref: string): any => {
  // split ref by slash
  const refs = ref.split("/");
  if (refs[0] !== "#") {
    throw "$ref : only local ref only.";
  }
  const [car, ...cdr] = refs;
  return resolve(apiYaml, cdr);
};

const buildResponse = (apiYaml: any, current: any): any => {
  if (current.example) {
    // if current has example, return contents of example.
    return current.example;
  } else {
    if (current.$ref) {
      const ref = resolveRef(apiYaml, current.$ref);
      return buildResponse(apiYaml, ref);
    } else {
      if (current.type && current.type === "array") {
        return [buildResponse(apiYaml, current.items)];
      } else if (current.type && current.type === "object") {
        const ret: Record<any> = {};
        for (const key in current.properties) {
          const prop = current.properties[key];
          const val = buildResponse(apiYaml, prop);
          if (val) {
            ret[key] = val;
          }
        }
        return ret;
      }
    }
  }
  return undefined;
};

// make JSON response from content object.
const makeJSONResponse = (apiYaml: any, current: any) => {
  if (current.example) {
    // if current has example, return contents of example.
    return JSON.stringify(current.example);
  } else if (current.schema.properties) {
    // properties in schema directly.
    const ret: Record<any> = {};
    for (const key in current.schema.properties) {
      const prop = current.schema.properties[key];
      const val = buildResponse(apiYaml, prop);
      if (val) {
        ret[key] = val;
      }
    }
    return JSON.stringify(ret);
  } else {
    const result = buildResponse(apiYaml, current.schema);
    if (result) {
      return JSON.stringify(result);
    }
  }
  return undefined;
};

// make XML response from content object.
const makeXMLResponse = (apiYaml: any, current: any) => {
  console.error("Sorry! XML response is not supported.");
  return undefined;
};

// make headers from example
const makeHeaders = (headers: any): Header[] => {
  const ret = [];
  if (headers) {
    for (const key in headers) {
      const val = headers[key];
      if (val && val.example) {
        ret.push({
          name: key,
          value: val.example,
        } as Header);
      }
    }
  }
  return ret;
};

export const makeEndpointsFromYaml = (apiYaml: string, sourceName: string) => {
  const ret: Endpoint[] = [];
  const api = yaml.load(apiYaml) as any;
  if (api.openapi && api.openapi.startsWith("3.")) {
    for (const path in api.paths) {
      const endpointPattern = path.replace(
        /\{([^\}]+)\}/g,
        (str, p1, offset) => {
          return ":" + p1;
        }
      );
      const pathInfo = api.paths[path];
      for (const method in pathInfo) {
        const responseInfo = pathInfo[method];
        const tmp: Endpoint = {
          pattern: endpointPattern,
          method: method.toUpperCase() as any,
          matches: [],
          name: responseInfo.operationId,
          source: sourceName,
        };
        ret.push(tmp);
        for (const status in responseInfo.responses) {
          const respStatusInfo = responseInfo.responses[status];
          const headers = makeHeaders(respStatusInfo.headers);
          if (
            respStatusInfo.content &&
            respStatusInfo.content.hasOwnProperty()
          ) {
            for (const content in respStatusInfo.content) {
              const contentBody = respStatusInfo.content[content];
              const respData =
                respStatusInfo.content === "application/json"
                  ? makeJSONResponse(api, contentBody)
                  : respStatusInfo.content === "application/xml"
                  ? makeXMLResponse(api, contentBody)
                  : respStatusInfo.content === "text/xml"
                  ? makeXMLResponse(api, contentBody)
                  : "Sample value";
              const pat: Pattern = {
                metadataType: "immidiate",
                metadata: {
                  status: Number(status),
                  headers: [
                    ...headers,
                    {
                      name: "content-type",
                      value: content,
                    },
                  ],
                  datatype: "value",
                  data: respData,
                } as Metadata,
              };
              tmp.matches.push(pat);
            }
          } else {
            const pat: Pattern = {
              metadataType: "immidiate",
              metadata: {
                status: Number(status),
                headers: [...headers],
              } as Metadata,
            };
            tmp.matches.push(pat);
          }
        }
      }
    }
    return ret;
  } else {
    throw "unsupported format. (swagger v2 and so on)";
  }
};
