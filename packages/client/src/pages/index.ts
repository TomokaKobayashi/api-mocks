import { h, text } from 'hyperapp'
import { monitor } from '../components/monitor';
import { AppState, setActiveTab } from '../modules/state';

export const MainPage = (): any => (state: AppState) => {
  const main = state.activeTab==='endpoints' ? 
    h('div', {}, text('endpoints')) :
    h('div', {}, monitor(state));
  return h('div', {}, [ 
    h('div', {class: 'tabs is-toggle is-small'}, [
      h('ul', {}, [
        h('li', {
          onclick: setActiveTab('endpoints'),
          class: state.activeTab==='endpoints' ? 'is-active' : undefined,
        }, [h('a', {}, text('Endpoints'))]),
        h('li', {
          onclick: setActiveTab('monitor'),
          class: state.activeTab==='monitor' ? 'is-active' : undefined,
        }, [h('a', {}, text('Monitor'))]),
      ])
    ]),
    main
  ]);
};
