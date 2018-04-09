import { h } from "hyperapp"

import "./DebugPaneContent.scss"

import { State, Actions, Run } from "../api"
import { ObjectDetailsPane } from "./ObjectDetailsPane"
import { RunsPane } from "./RunsPane"

export interface DebugPaneContentProps {
  state: State
  actions: Actions
  runs: Run[]
}

export function DebugPaneContent(props: DebugPaneContentProps) {
  const { state, actions, runs } = props
  if (runs.length === 0) {
    return (
      <div class="debug-pane-content">
        <p>No debug information found, please debug this project.</p>
      </div>
    )
  }
  return (
    <div class="debug-pane-content">
      {RunsPane({ state, actions, runs })}
      {ObjectDetailsPane({ state, actions })}
    </div>
  )
}
