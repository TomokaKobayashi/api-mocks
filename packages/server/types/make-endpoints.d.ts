import { Endpoint, Yaml2RoutesExtraConfig } from "common";
export declare const makeEndpointsFromYaml: (apiYaml: string, sourceName: string, requiredOnly?: number, config?: Yaml2RoutesExtraConfig) => Endpoint[];
