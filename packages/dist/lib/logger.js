"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorLogger = void 0;
class ErrorLogger {
    constructor(logNum) {
        this.logData = [];
        this.logNum = logNum;
    }
    log(data) {
        if (this.logNum <= 0)
            return;
        // logging errors only
        if (data.status < 300)
            return;
        // limitation of the number of logging
        if (this.logData.length >= this.logNum) {
            this.logData.shift();
        }
        this.logData.push(Object.assign({}, data));
    }
    getLog() {
        return this.logData;
    }
}
exports.ErrorLogger = ErrorLogger;
;
