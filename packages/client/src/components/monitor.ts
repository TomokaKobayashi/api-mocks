import { h, text } from 'hyperapp';
import { AppState } from '../modules/state';

const stateMonitor = (state: AppState) => {
  return h('div', {}, [text(JSON.stringify(state.monitor.serverState, null, '  '))]);
};

const logMonitor = (state: AppState) => {
  return h('div', {}, [text('logMonitor')]);
};

export const monitor = (state: AppState) => {
  return h('div', {class: ''}, [
    stateMonitor(state),
    logMonitor(state),
  ]);
};
