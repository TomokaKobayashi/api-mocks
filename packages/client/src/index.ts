import { app } from 'hyperapp'

import { state } from './modules/state'
import { view } from './root'
import './styles'
const node = document.getElementById('app')
if(node){
  const main = app({init: state, view, node})
}
