import { Counter } from './counter'

export namespace Modules {
  export type AppState = Counter.IState
  export type AppActions = Counter.IActions
  export const state: AppState = { ...Counter.state }
  export const actions: AppActions = { ...Counter.actions }
}