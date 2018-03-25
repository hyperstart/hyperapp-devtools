import { h, ActionsType, View } from "hyperapp"

import * as devtools from "./devtools"
import enhanceActions from "./enhanceActions"

const ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const SIZE = 16
const rand = () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]

export const guid = () =>
  Array.apply(null, Array(SIZE))
    .map(rand)
    .join("")

export interface App<State = any, Actions = any> {
  (
    state: State,
    actions: ActionsType<State, Actions>,
    view: View<State, Actions>,
    container: Element | null
  ): Actions
}

export function hoa<State, Actions>(app: App): App<State, Actions> {
  const div = document.createElement("div")
  div.id = "hyperapp-devtools"
  document.body.appendChild(div)

  const devtoolsApp: devtools.Actions = app(
    devtools.state,
    devtools.actions,
    devtools.view,
    div
  )

  return function(state: any, actions: any, view, element) {
    const runId = guid()
    actions = enhanceActions(devtoolsApp.logAction, runId, actions)
    actions.$__SET_STATE = state => state
    devtoolsApp.logInit({ runId, state, timestamp: new Date().getTime() })
    return app(state, actions, view, element)
  }
}
export default hoa
