// this functions make route info from yaml.
import yaml from 'js-yaml';

export const makeRoute = (apiYaml: string) => {
    const api = yaml.load(apiYaml) as any;
    if(api.openapi && api.openapi.startsWith('3.')){
        for(const path in api.paths){
            const pathInfo = api.paths[path];
            for(const method in pathInfo){
                const responseInfo = pathInfo[method];
                for(const status in responseInfo.responses){
                    const respStatusInfo = responseInfo.responses[status];
                    console.log(`${method} : ${status} : ${path}`);
                    if(respStatusInfo.content && respStatusInfo.content.hasOwnProperty()){
                        for(const content in respStatusInfo.content){
                            console.log(`${method} : ${status} : ${content} : ${path}`);
                        }
                    }else{
                        console.log(`${method} : ${status} : NO-CONTENTS : ${path}`);
                    }
                }
            }
        }
        return {};
    }else{
        throw 'unsupported format. (swagger v2 and so on)'
    }
}