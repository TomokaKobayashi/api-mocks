import { h, text } from 'hyperapp'
import { monitor } from '../components/monitor';
import { TreeBranch, TreeNode } from '../components/tree-view';
import { AppState, getServerState, setActiveTab } from '../modules/state';

const testData: TreeNode = {
  name: 'root',
  expanded: true,
  children:[
    {
      name: 'child1',
      value: 'value1'
    },
    {
      name: 'child2',
      value: 'value2'
    },
  ]
}

export const MainPage = (): any => (state: AppState) => {
  const main = state.activeTab==='endpoints' ? 
    h('div', {}, text('endpoints')) :
    h('div', {}, monitor(state));
  return h('div', {}, [ 
    TreeBranch(testData),
    h('div', {class: 'tabs is-toggle is-small'}, [
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
