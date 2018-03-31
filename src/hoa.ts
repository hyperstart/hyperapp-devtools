import { h, ActionsType, View } from "hyperapp"

import { Actions } from "./api"
import { state } from "./state"
import { actions } from "./actions"
import { view } from "./view"
import enhanceActions from "./enhanceActions"

const ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const SIZE = 16
const rand = () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]

export const guid = () =>
  Array.apply(null, Array(SIZE))
    .map(rand)
    .join("")

// const faScript = document.createElement("script")
// faScript.defer = true
// faScript.src = "https://use.fontawesome.com/releases/v5.0.8/js/all.js"
// faScript.integrity =
//   "sha384-SlE991lGASHoBfWbelyBPLsUlwY1GwNDJo3jSJO04KZ33K2bwfV9YBauFfnzvynJ"
// faScript.crossOrigin = "anonymous"
// document.head.appendChild(faScript)

export interface App<AppState = any, AppActions = any> {
  (
    state: AppState,
    actions: ActionsType<AppState, AppActions>,
    view: View<AppState, AppActions>,
    container: Element | null
  ): AppActions
}

export function hoa<AppState, AppActions>(app: App): App<AppState, AppActions> {
  const div = document.createElement("div")
  div.id = "hyperapp-devtools"
  document.body.appendChild(div)

  const devtoolsApp: Actions = app(state, actions, view, div)

  return function(state: any, actions: any, view, element) {
    const runId = guid()
    actions = enhanceActions(devtoolsApp.logAction, runId, actions)
    actions.$__SET_STATE = state => state
    devtoolsApp.logInit({ runId, state, timestamp: new Date().getTime() })
    return app(state, actions, view, element)
  }
}
export default hoa
