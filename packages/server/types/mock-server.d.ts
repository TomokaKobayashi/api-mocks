import { Options } from "http-proxy-middleware";
export declare type AppConfig = {
    port: number;
    routesPath?: string;
    disabledSettings?: string[];
    staticContents?: string;
    apiRoot?: string;
    uploadPath?: string;
    staticProxy?: Options;
    enableCors?: boolean;
};
