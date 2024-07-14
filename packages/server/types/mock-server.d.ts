import { Options } from "http-proxy-middleware";
export type AppConfig = {
    port: number;
    routesPath?: string;
    disabledSettings?: string[];
    staticContents?: string;
    apiRoot?: string;
    uploadPath?: string;
    staticProxy?: Options;
    enableCors?: boolean;
    allowHeaders?: string;
    maxReceiveSize?: string;
    enableHttps?: boolean;
    domainName?: string;
    keepUploadFile?: boolean;
};
