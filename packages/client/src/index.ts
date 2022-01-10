import { app } from 'hyperapp'
import { location } from '@hyperapp/router'

import { Modules as M } from './modules'
import { view } from './root'
let main
if (process.env.NODE_ENV === 'development') {
  main = require('@hyperapp/logger').withLogger(app)(M.state, M.actions, view, document.getElementById('app'))
} else {
  main = app(M.state, M.actions, view, document.getElementById('app'))
}
const unsubscribe = location.subscribe(main.location)