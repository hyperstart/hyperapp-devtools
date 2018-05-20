import { h } from "hyperapp"

import "./DebugPaneContent.scss"

import { State, Actions } from "../api"
import { ObjectDetailsPane } from "./ObjectDetailsPane"
import { RunsPane } from "./RunsPane"

export interface DebugPaneContentProps {
  state: State
  actions: Actions
}

export function DebugPaneContent(props: DebugPaneContentProps) {
  const { state, actions } = props

  const runs = state.runs.map(id => state.runsById[id])
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
