import { h } from "hyperapp"

import "./ObjectDetailsPane.scss"

import { State, Actions, Run } from "../api"

export interface ObjectDetailsPaneProps {
  state: State
  actions: Actions
}

function PaneData(props: ObjectDetailsPaneProps) {
  const { state, actions } = props

  return (
    <div class="object-details-pane scrollable">
      <pre class="scrollable-content">
        {JSON.stringify(state.selectedAction.actionData, null, 2)}
      </pre>
    </div>
  )
}

function PaneResult(props: ObjectDetailsPaneProps) {
  const { state, actions } = props

  return (
    <div class="object-details-pane scrollable">
      <pre class="scrollable-content">
        {JSON.stringify(state.selectedAction.actionResult, null, 2)}
      </pre>
    </div>
  )
}

function PaneState(props: ObjectDetailsPaneProps) {
  const { state, actions } = props

  return (
    <div class="object-details-pane scrollable">
      <pre class="scrollable-content">
        {JSON.stringify(state.selectedAction.nextState, null, 2)}
      </pre>
    </div>
  )
}

function PaneDebuggerState(props: ObjectDetailsPaneProps) {
  const { state, actions } = props

  return (
    <div class="object-details-pane scrollable">
      <pre class="scrollable-content">{JSON.stringify(state, null, 2)}</pre>
    </div>
  )
}

export function ObjectDetailsPane(props: ObjectDetailsPaneProps) {
  switch (props.state.valueDisplay) {
    case "data":
      return PaneData(props)
    case "result":
      return PaneResult(props)
    case "state":
      return PaneState(props)
    case "debugger-state":
      return PaneDebuggerState(props)
  }
}
