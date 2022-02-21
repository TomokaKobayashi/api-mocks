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

export const setActiveTab = (state: any, tab: TabKind) => {
  console.log(`set tab = ${tab}`);
  return {...state, activeTab: tab};
}

export const setServerState = (state: any, serverState: any) => {
  const ret = {...state};
  ret.monitor.serverState = serverState;
  console.log(JSON.stringify(ret, null, '  '))
  return ret;
}

type fetchOption = {
  url: string;
  action: any;
}

const fetchJson = (dispatch: any, options: fetchOption) => {
  fetch(options.url)
  .then(response => response.json())
  .then(data => dispatch(options.action, data))
}

export const getServerState = (state: any) => [
  state,
  [
    fetchJson,
    {
      url: '/control/monitor/state',
      action: setServerState
    }
  ]
];
