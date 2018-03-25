import { h } from "hyperapp"

import { State, Actions, PaneDisplay } from "../api"

import { DebuggerOptions } from "./DebuggerOptions"
import { DebugPaneToolbar } from "./DebugPaneToolbar"

import "./DebugPane.scss"

export interface DebugPaneProps {
  state: State
  actions: Actions
}

export function DebugPane(props: DebugPaneProps) {
  const { state, actions } = props

  return (
    <div class="debug-pane">
      {DebugPaneToolbar({ state, actions })}
      {DebuggerOptions({ state, actions })}
      <div class="debug-content scrollable">
        <pre class="scrollable-content">{JSON.stringify(state, null, 2)}</pre>
      </div>
    </div>
  )
}
