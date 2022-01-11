import { h, text } from 'hyperapp'
import { Modules as M } from '../modules'

export const Home = (): any => (state: M.AppState) => {
  return h('div', {}, [
    h('h1', {}, text(state.count)),
    h('button', {onclick: (ev) => M.actions.down(1)}, text('-')),
    h('button', {onclick: (ev) => M.actions.up(1)}, text('+'))
  ])
}
