import { text } from 'hyperapp'
import { Modules as M } from '../modules'
const { div, h1, button } = require('@hyperapp/html')

export const Home = (): any => (state: M.AppState) => {
  return div({}, [
    h1({}, text(state.count)),
    button({onclick: M.actions.down(2), class: 'button is-secondary is-small'}, text('-')),
    button({onclick: M.actions.up(2), class: 'button is-primary is-small'}, text('+'))
  ])
}
