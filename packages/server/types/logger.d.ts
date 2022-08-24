import { ErrorLog } from "./types";
export declare class ErrorLogger {
    private logData;
    private logNum;
    constructor(logNum: number);
    log(data: ErrorLog): void;
    getLog(): ErrorLog[];
}
