// this functions make route info from yaml.
import yaml from "js-yaml";
import { Endpoint, Metadata, Pattern, Header, Record } from "./types";

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
    }
  }
  return undefined;
};

// make response object from content object.
const makeResponseObject = (apiYaml: any, contentBody: any) => {
  if (contentBody.example) {
    // if contentBody has example, it returns contents of example.
    return contentBody.example;
  } else {
    const result = buildResponse(apiYaml, contentBody.schema);
    if (result) {
      return result;
    }
  }
  return undefined;
};

type XMLStructure = {
  name?: string
  attributes: Record<any>
  children: XMLStructure[]
  value?: string
};

// make XML structure from schema and response object
const buildXMLStructure = (apiYaml: any, current: any, respObject: any, name: string | undefined): XMLStructure | undefined => {
  if (current.$ref) {
    const ref = resolveRef(apiYaml, current.$ref);
    return buildXMLStructure(apiYaml, ref, respObject, name);
  } else if (current.type && current.type === 'array') {
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
          children: []
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
        value: '' + respObject,
      }
    }
  }
  return undefined;
};

const convertToXML = (xml: XMLStructure): string => {
  const attribs = [];
  for (const key in xml.attributes) {
    attribs.push(`${key}="${xml.attributes[key].value}"`);
  }
  if (xml.children.length > 0) {
    const childXML = [];
    for (const child of xml.children) {
      childXML.push(convertToXML(child));
    }
    return `<${xml.name} ${attribs.join(' ')}>${childXML.join('')}</${xml.name}>`
  } else {
    if (xml.value) {
      // terminal node
      return `<${xml.name} ${attribs.join(' ')}>${xml.value}</${xml.name}>`
    } else {
      // no child node
      return `<${xml.name} ${attribs.join(' ')}/>`
    }
  }
};

// make XML response from content object.
const makeXMLResponse = (apiYaml: any, contentBody: any, respObject: any) => {
  // map respObject to xml
  const xmlStructure = buildXMLStructure(apiYaml, contentBody.schema, respObject, undefined);
  if (xmlStructure) {
    const retValue = convertToXML(xmlStructure);
    console.log(retValue);
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
          if (respStatusInfo.content) {
            for (const content in respStatusInfo.content) {
              const contentBody = respStatusInfo.content[content];
              const respObject = makeResponseObject(api, contentBody);
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
