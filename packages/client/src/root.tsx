import { h } from 'hyperapp'
import { Switch, Route } from '@hyperapp/router'
import { Components } from './components'

export const view = () => (
  <Switch>
    <Route path="/" render={Components.Home} />
    <Route path="/about" render={Components.About} />
  </Switch>
)
