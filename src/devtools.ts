import { h } from "hyperapp"

import { guid } from "./utils"
import { view } from "./view"
import { state } from "./state"
import { Actions } from "./api"
import * as actions from "./actions"
import enhanceActions from "./enhanceActions"
import { injectedSetState } from "./api"

// rewrite the view more permissive than HA to allow for multiple VNode implementation
// e.g. the one in HA 1.1.2 and the on in HA 1.2.5
export interface View {
  (state: any, actions: any): any
}

export interface HypperApp {
  (state: any, actions: any, view: View, container: Element | null): any
}

let devtoolsApp: Actions

export function getDevtoolsApp() {
  return devtoolsApp
}

export function devtools<App extends HypperApp>(app: App): App {
  const div = document.createElement("div")
  document.body.appendChild(div)

  devtoolsApp = app(state, actions, view, div)

  return <App>function(state: any, actions: any, view, element) {
    const runId = guid()

    actions[injectedSetState] = function timeTravel(state) {
      return state
    }
    actions = enhanceActions(devtoolsApp, runId, actions)

    const interop: any = app(state, actions, view, element)

    devtoolsApp.logInit({
      runId,
      state,
      timestamp: new Date().getTime(),
      interop
    })

    return interop
  }
}
export default devtools
