import { h, text } from 'hyperapp'
import { monitor } from '../components/monitor';
import { TestNode } from '../components/tree-view';
import { AppState, getServerState, setActiveTab } from '../modules/state';

export const MainPage = (): any => (state: AppState) => {
  const main = state.activeTab==='endpoints' ? 
    h('div', {}, text('endpoints')) :
    h('div', {}, monitor(state));
  return h('div', {}, [ 
    h('div', {class: 'tabs is-toggle is-small'}, [
      TestNode({name:'name', value:'value', children:[]}),
      h('ul', {}, [
        h('li', {
          onclick: (state) => setActiveTab(state, 'endpoints'),
          class: state.activeTab==='endpoints' ? 'is-active' : undefined,
        }, [h('a', {}, text('Endpoints'))]),
        h('li', {
          onclick: (state) => getServerState(setActiveTab(state, 'monitor')),
          class: state.activeTab==='monitor' ? 'is-active' : undefined,
        }, [h('a', {}, text('Monitor'))]),
      ])
    ]),
    main
  ]);
};
