import { h } from "hyperapp"

import { Actions } from "./api"
import { state } from "./state"
import { actions } from "./actions"
import { view } from "./view"
import enhanceActions from "./enhanceActions"
import { injectedSetState } from "./api"

const ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const SIZE = 16
const rand = () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]

export const guid = () =>
  Array.apply(null, Array(SIZE))
    .map(rand)
    .join("")

// rewrite the view more permissive than HA to allow for multiple VNode implementation
// e.g. the one in HA 1.1.2 and the on in HA 1.2.5
export interface View {
  (state: any, actions: any): any
}

export interface HypperApp {
  (state: any, actions: any, view: View, container: Element | null): any
}

export function hoa<App extends HypperApp>(app: App): App {
  const div = document.createElement("div")
  document.body.appendChild(div)

  const devtoolsApp: Actions = app(state, actions, view, div)

  return <App>function(state: any, actions: any, view, element) {
    const runId = guid()

    actions[injectedSetState] = function timeTravel(state) { return state; };
    actions = enhanceActions(devtoolsApp.logAction, runId, actions)

    const interop: any = app(state, actions, view, element)

    devtoolsApp.logInit({ runId, state, timestamp: new Date().getTime(), interop })

    return interop;
  }
}
export default hoa
