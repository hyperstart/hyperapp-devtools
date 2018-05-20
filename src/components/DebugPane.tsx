import { h } from "hyperapp"

import { State, Actions, PaneDisplay } from "../api"

import { DebuggerOptions } from "./DebuggerOptions"
import { DebugPaneToolbar } from "./DebugPaneToolbar"
import { DebugPaneContent } from "./DebugPaneContent"

import "./DebugPane.scss"

export interface DebugPaneProps {
  state: State
  actions: Actions
}

export function DebugPane(props: DebugPaneProps) {
  const { state, actions } = props

  return (
    <div class="hyperapp-devtools debug-pane">
      {DebugPaneToolbar({ state, actions })}
      {DebuggerOptions({ state, actions })}
      {DebugPaneContent({ state, actions })}
    </div>
  )
}
