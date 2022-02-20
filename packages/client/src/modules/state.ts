import { resourceUsage } from "process";

type EndpointsState = {

};

type ServerLog = {
  id: string;
  endpoint: string;
  method: string;
  headers: string;
};

type MonitorState = {
  serverState: any;
  serverLogs: ServerLog[];
};

type TabKind = 'endpoints' | 'monitor';

export type AppState = {
  activeTab: TabKind;
  endpoints: EndpointsState;
  monitor: MonitorState;
};

export const state: AppState = {
  activeTab: 'monitor',
  endpoints: {},
  monitor: {
    serverState: {},
    serverLogs: [],
  }
}

export const setActiveTab = (tab: TabKind) => {
  return (state: any) => {
    console.log(`set tab = ${tab}`);
    return {...state, activeTab: tab};
  }
}

export const setServerState = (state: any, serverState: any) => {
  return {...state, serverState: serverState};
}