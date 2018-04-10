import { h } from "hyperapp"

import "./ObjectDetailsPane.scss"

import { State, Actions, Run, AppAction } from "../api"
import { getSelectedAction } from "../selectors";

interface PaneProps {
  state: State
  actions: Actions
  action: AppAction
}

function PaneData(props: PaneProps) {
  const { action } = props

  return (
    <div class="object-details-pane scrollable">
      <pre class="scrollable-content">
        {JSON.stringify(action.actionData, null, 2)}
      </pre>
    </div>
  )
}

function PaneResult(props: PaneProps) {
  const { action } = props

  return (
    <div class="object-details-pane scrollable">
      <pre class="scrollable-content">
        {JSON.stringify(action.actionResult, null, 2)}
      </pre>
    </div>
  )
}

function PaneState(props: PaneProps) {
  const { action } = props

  return (
    <div class="object-details-pane scrollable">
      <pre class="scrollable-content">
        {JSON.stringify(action.nextState, null, 2)}
      </pre>
    </div>
  )
}

function PaneDebuggerState(props: PaneProps) {
  const { state } = props

  return (
    <div class="object-details-pane scrollable">
      <pre class="scrollable-content">{JSON.stringify(state, null, 2)}</pre>
    </div>
  )
}

export interface ObjectDetailsPaneProps {
  state: State
  actions: Actions
}

export function ObjectDetailsPane(props: ObjectDetailsPaneProps) {
  const { state, actions } = props
  const action = getSelectedAction(props.state)
  switch (props.state.valueDisplay) {
    case "data":
      return PaneData({ state, actions, action })
    case "result":
      return PaneResult({ state, actions, action })
    case "state":
      return PaneState({ state, actions, action })
    case "debugger-state":
      return PaneDebuggerState({ state, actions, action })
  }
}
