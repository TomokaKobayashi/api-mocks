// COPYRIGHT 2021 Kobayashi, Tomoka
// this functions make route info from yaml.
import yaml from "js-yaml";
import {
  Endpoint,
  Metadata,
  Pattern,
  Header,
  Record,
  Yaml2RoutesExtraConfig,
  SuppressPatternArray,
} from "common";
import { OpenAPIRequestValidatorArgs } from "openapi-request-validator";
import { v4 } from "uuid";

// resolve ref to obujet
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
// rough copy method...
const easyCopy = (obj: any) => {
  if (!obj) return undefined;
  return JSON.parse(JSON.stringify(obj));
};

const replaceRef = (apiYaml: any, node: any) => {
  if (!node) return;
  if (Array.isArray(node)) {
    for (const child of node) {
      replaceRef(apiYaml, child);
    }
  } else if (typeof node === "object") {
    for (const key in node) {
      let child = node[key];
      if (child && child.$ref) {
        child = easyCopy(resolveRef(apiYaml, child.$ref));
        child.$ref = undefined;
        node[key] = child;
      }
      replaceRef(apiYaml, child);
    }
  }
};

// build response from example fields.
const buildResponse = (apiYaml: any, current: any): any => {
  if (current.example) {
    // if current has example, return contents of example.
    return current.example;
  } else {
    if (current.$ref) {
      const ref = resolveRef(apiYaml, current.$ref);
      return buildResponse(apiYaml, ref);
    } else if (current.properties) {
      const ret: Record<any> = {};
      for (const key in current.properties) {
        const prop = current.properties[key];
        const val = buildResponse(apiYaml, prop);
        if (val) {
          ret[key] = val;
        }
      }
      return ret;
    } else if (current.type && current.type === "array") {
      return [buildResponse(apiYaml, current.items)];
    } else if (current.type === "integer") {
      if (current.format === "int32") {
        return (-1 * 2) ^ 31;
      }
      return -1 * Number.MAX_SAFE_INTEGER;
    } else if (current.type === "number") {
      return -1 * Number.MAX_VALUE;
    } else if (current.type === "string") {
      switch (current.format) {
        case "date":
          return "2021-12-31";
        case "date-time":
          return "2021-12-31T23:59:59Z";
        case "byte":
          return "QUJDREVGRw==";
        default:
          return "string";
      }
    } else if (current.type === "boolean") {
      return false;
    }
  }
  return undefined;
};

// suppress optional data by 'requiredOnly' parameter.
// 0: not suppress
// 1: basic required data and required member in array
// 2: basic required data and empty array
// 3: basic required data only
type SuppressSetting = {
  level: number;
  patterns: SuppressPatternArray;
};

const getSuppressSetting = (settings: SuppressSetting[], key: string) => {
  for (const setting of settings) {
    for (const pattern of setting.patterns) {
      if(pattern instanceof RegExp){
        if (pattern.test(key)) {
          return setting;
        }
      }else{
        if(pattern(key)){
          return setting;
        }
      }
    }
  }
  return undefined;
};

const suppressData = (
  schema: any,
  resp: any,
  requiredOnly: number,
  settings: SuppressSetting[],
  parentKey?: string
) => {
  if (schema.type === "object") {
    const props = schema.properties;
    const required = schema.required as Array<string>;
    const requiredSet: Set<string> = new Set();
    if (required) required.forEach((elm) => requiredSet.add(elm));
    for (const key in resp) {
      const currentKey = !parentKey ? key : `${parentKey}.${key}`;
      const setting = getSuppressSetting(settings, currentKey);
      const requiredTemp = setting ? setting.level : requiredOnly;
      const subSchema = props[key];
      // if field schema does not exist, omit
      if(!subSchema) continue;
      if (requiredSet.has(key)) {
        // required
        if (subSchema.type === "array") {
          if (requiredTemp >= 2) {
            resp[key] = [];
          } else {
            const arData = resp[key] as any[];
            let idx = 0;
            for (const data of arData) {
              const tempKey = `${currentKey}[${idx}]`;
              suppressData(
                subSchema.items,
                data,
                requiredTemp,
                settings,
                tempKey
              );
              idx++;
            }
          }
        } else {
          suppressData(
            subSchema,
            resp[key],
            requiredTemp,
            settings,
            currentKey
          );
        }
      } else {
        // optional
        if (subSchema.type === "array") {
          switch (requiredTemp) {
            case 1:
              const arData = resp[key] as any[];
              let idx = 0;
              for (const data of arData) {
                const tempKey = `${currentKey}[${idx}]`;
                suppressData(
                  subSchema.items,
                  data,
                  requiredTemp,
                  settings,
                  tempKey
                );
                idx++;
              }
              break;
            case 2:
              resp[key] = [];
              break;
            case 3:
              resp[key] = undefined;
              break;
          }
        } else {
          if (requiredTemp > 0) {
            resp[key] = undefined;
          } else {
            suppressData(
              subSchema,
              resp[key],
              requiredOnly,
              settings,
              currentKey
            );
          }
        }
      }
    }
  } else if (schema.type === "array") {
    let idx = 0;
    for (const data of resp) {
      const tempKey = `${parentKey || ""}[${idx}]`;
      suppressData(schema.items, data, requiredOnly, settings, tempKey);
      idx++;
    }
  }
};

const makeSuppressSetting = (config?: Yaml2RoutesExtraConfig) => {
  const ret: SuppressSetting[] = [];
  if (config && config.requiredSetting && Array.isArray(config.requiredSetting)) {
    for (const suppress of config.requiredSetting) {
      ret.push({
        level: suppress.level,
        patterns: Array.isArray(suppress.pattern)
          ? suppress.pattern
          : [suppress.pattern ],
      });
    }
  }
  return ret;
};

const suppressOptionals = (
  apiYaml: any,
  body: any,
  response: any,
  requiredOnly: number,
  config?: Yaml2RoutesExtraConfig
) => {
  if (!requiredOnly) return response;
  // prepare to suppress
  const respData = easyCopy(response);
  const copiedBody = easyCopy(body);
  replaceRef(apiYaml, copiedBody);
  const settings: SuppressSetting[] = makeSuppressSetting(config);
  suppressData(copiedBody.schema, respData, requiredOnly, settings);
  return respData;
};

// make response object from content object.
const makeResponseObject = (
  apiYaml: any,
  contentBody: any,
  requiredOnly: number,
  config?: Yaml2RoutesExtraConfig
) => {
  if (contentBody.example) {
    // if contentBody has example, it returns contents of example.
    return suppressOptionals(
      apiYaml,
      contentBody,
      contentBody.example,
      requiredOnly,
      config
    );
  } else {
    const result = buildResponse(apiYaml, contentBody.schema);
    if (result) {
      return suppressOptionals(
        apiYaml,
        contentBody,
        result,
        requiredOnly,
        config
      );
    }
  }
  return undefined;
};

type XMLStructure = {
  name?: string;
  attributes: Record<any>;
  children: XMLStructure[];
  value?: string;
};

// make XML structure from schema and response object
const buildXMLStructure = (
  apiYaml: any,
  current: any,
  respObject: any,
  name: string | undefined
): XMLStructure | undefined => {
  if (current.$ref) {
    const ref = resolveRef(apiYaml, current.$ref);
    return buildXMLStructure(apiYaml, ref, respObject, name);
  } else if (current.type && current.type === "array") {
    // array type
    if (Array.isArray(respObject)) {
      // strange document because of no root name.
      if (!name) return undefined;
      const item = current.items;
      if (current.xml && current.xml.wrapped) {
        const wrap = current.xml.name;
        const ret: XMLStructure = {
          name: wrap,
          attributes: {},
          children: [],
        };
        for (const val of respObject) {
          const tmp = buildXMLStructure(apiYaml, item, val, wrap);
          if (tmp) {
            ret.children.push(tmp);
          }
        }
        return ret;
      } else {
        const ret: XMLStructure = {
          name,
          attributes: {},
          children: [],
        };
        for (const val of respObject) {
          const tmp = buildXMLStructure(apiYaml, item, val, undefined);
          if (tmp) {
            ret.children.push(tmp);
          }
        }
        return ret;
      }
    }
  } else if (current.properties) {
    // object type
    const ret: XMLStructure = {
      name: current.xml && current.xml.name ? current.xml.name : name,
      attributes: {},
      children: [],
    };
    for (const key in current.properties) {
      const val = respObject[key];
      const item = current.properties[key];
      if (val) {
        const tmp = buildXMLStructure(apiYaml, item, val, key);
        if (tmp) {
          if (item.xml && item.xml.attribute) {
            ret.attributes[key] = tmp;
          } else {
            ret.children.push(tmp);
          }
        }
      }
    }
    return ret;
  } else if (current.type) {
    // other types
    if (name) {
      return {
        name,
        attributes: {},
        children: [],
        value: "" + respObject,
      };
    }
  }
  return undefined;
};

const convertToXML = (xml: XMLStructure): string => {
  const attribs = [];
  for (const key in xml.attributes) {
    attribs.push(`${key}="${xml.attributes[key].value}"`);
  }
  const openTag = (xml.name + " " + attribs.join(" ")).trim();
  if (xml.children.length > 0) {
    const childXML = [];
    for (const child of xml.children) {
      childXML.push(convertToXML(child));
    }
    return `<${openTag}>${childXML.join("")}</${xml.name}>`;
  } else {
    if (xml.value) {
      // terminal node
      return `<${openTag}>${xml.value}</${xml.name}>`;
    } else {
      // no child node
      return `<${openTag}/>`;
    }
  }
};

// make XML response from content object.
const makeXMLResponse = (apiYaml: any, contentBody: any, respObject: any) => {
  // map respObject to xml
  const xmlStructure = buildXMLStructure(
    apiYaml,
    contentBody.schema,
    respObject,
    undefined
  );
  if (xmlStructure) {
    const retValue = convertToXML(xmlStructure);
    return retValue;
  }
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

const makeValidatorParams = (
  apiYaml: any,
  methodInfo: any
): OpenAPIRequestValidatorArgs => {
  // rough copy
  const params = easyCopy(methodInfo.parameters);
  replaceRef(apiYaml, params);
  const body = easyCopy(methodInfo.requestBody);
  replaceRef(apiYaml, body);
  const ret: OpenAPIRequestValidatorArgs = {
    parameters: params,
    requestBody: body,
  };
  return ret;
};

export const makeEndpointsFromYaml = (
  apiYaml: string,
  sourceName: string,
  requiredOnly: number = 0,
  config?: Yaml2RoutesExtraConfig
) => {
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
        const methodInfo = pathInfo[method];
        const validatorParams = makeValidatorParams(api, methodInfo);
        const tmp: Endpoint = {
          pattern: endpointPattern,
          method: method.toUpperCase() as any,
          matches: [],
          name: methodInfo.operationId,
          source: sourceName,
          validatorArgs: validatorParams,
          count: 1,
          id: v4(),
        };
        ret.push(tmp);
        for (const status in methodInfo.responses) {
          const respStatusInfo = methodInfo.responses[status];
          const headers = makeHeaders(respStatusInfo.headers);
          const contentLen = respStatusInfo.content
            ? Object.keys(respStatusInfo.content).length
            : 0;
          if (contentLen > 0) {
            for (const content in respStatusInfo.content) {
              const contentBody = respStatusInfo.content[content];
              const respObject = makeResponseObject(
                api,
                contentBody,
                requiredOnly,
                config
              );
              if (respObject) {
                const respData =
                  content === "application/json"
                    ? JSON.stringify(respObject)
                    : content === "application/xml"
                    ? makeXMLResponse(api, contentBody, respObject)
                    : content === "text/xml"
                    ? makeXMLResponse(api, contentBody, respObject)
                    : "Sample value";
                const pat: Pattern = {
                  metadataType: "immediate",
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
              } else {
                const pat: Pattern = {
                  metadataType: "immediate",
                  metadata: {
                    status: Number(status),
                    headers: [...headers],
                  } as Metadata,
                };
                tmp.matches.push(pat);
              }
            }
          } else {
            const pat: Pattern = {
              metadataType: "immediate",
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
