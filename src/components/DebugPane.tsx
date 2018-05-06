import { h } from "hyperapp"

import { State, Actions, PaneDisplay } from "../api"

import { DebuggerOptions } from "./DebuggerOptions"
import { DebugPaneToolbar } from "./DebugPaneToolbar"
import { DebugPaneContent } from "./DebugPaneContent"

import "./DebugPane.scss"
import { getRuns } from "../selectors"

export interface DebugPaneProps {
  state: State
  actions: Actions
}

export function DebugPane(props: DebugPaneProps) {
  const { state, actions } = props

  const runs = getRuns(state)
  return (
    <div class="debug-pane">
      {DebugPaneToolbar({ state, actions, runs })}
      {DebuggerOptions({ state, actions })}
      {DebugPaneContent({ state, actions, runs })}
    </div>
  )
}
