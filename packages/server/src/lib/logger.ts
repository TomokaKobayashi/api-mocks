import { ErrorLog } from "./types";

export class ErrorLogger{
  private logData: ErrorLog[] = [];
  private logNum: number;

  constructor(logNum: number){
    this.logNum = logNum;
  }

  log(data: ErrorLog){
    if(this.logNum<=0) return;
    // logging errors only
    if(data.status<300) return;
    // limitation of the number of logging
    if(this.logData.length>=this.logNum){
      this.logData.shift();
    }
    this.logData.push({...data});
  }

  getLog(){
    return this.logData;
  }
};
