import { h, text } from 'hyperapp'
import { Modules } from '../modules'

export const About = (): any => (
  state: Modules.AppState,
  actions: Modules.AppActions
) => {
  return h('div', {}, [
    h('h1', {}, text('About')),
  ])
}
