import { app } from 'hyperapp'

import { Modules as M } from './modules'
import { view } from './root'
import './styles'
const node = document.getElementById('app')
if(node){
  const main = app({init: M.state, view, node})
}
