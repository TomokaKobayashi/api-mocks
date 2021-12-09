// this functions make route info from yaml.
import yaml from 'js-yaml';
import { Endpoint, Metadata, Pattern } from './types';

const buildResponse = (apiYaml: any, current: any) => {

};

const makeResponse = (apiYaml: any, current: any) => {
    if(current.examples){
        // if current has examples, return contents of examples
        return current.examples;
    }else{
        

    }
    if(current.type==='array'){
    }else{
    }
};

export const makeEndpointsFromYaml = (apiYaml: string, sourceName: string) => {
    const ret: Endpoint[] = [];
    const api = yaml.load(apiYaml) as any;
    if(api.openapi && api.openapi.startsWith('3.')){
        for(const path in api.paths){
            const endpointPattern = path.replace(/\{([^\}]+)\}/g, (str, p1, offset)=>{return ':' + p1});
            const pathInfo = api.paths[path];
            for(const method in pathInfo){
                const responseInfo = pathInfo[method];
                const tmp: Endpoint = {
                    pattern: endpointPattern,
                    method: method.toUpperCase() as any,
                    matches: [],
                    name: responseInfo.operationId,
                    source: sourceName,
                };
                ret.push(tmp);
                for(const status in responseInfo.responses){
                    const respStatusInfo = responseInfo.responses[status];
                    if(respStatusInfo.content && respStatusInfo.content.hasOwnProperty()){
                        for(const content in respStatusInfo.content){
                            const pat: Pattern = {
                                metadataType: 'immidiate',
                                metadata: {
                                    status: Number(status),
                                    headers: [{
                                        name: 'content-type',
                                        value: content,
                                    }],
                                    datatype: 'object',
                                    data: {
                                        name: 'Sample Data',
                                    },
                                } as Metadata,
                            };
                            tmp.matches.push(pat);
                        }
                    }else{
                        const pat: Pattern = {
                            metadataType: 'immidiate',
                            metadata: {
                                status: Number(status),
                            } as Metadata,
                        };
                        tmp.matches.push(pat);
                    }
                }
            }
        }
        return ret;
    }else{
        throw 'unsupported format. (swagger v2 and so on)'
    }
}