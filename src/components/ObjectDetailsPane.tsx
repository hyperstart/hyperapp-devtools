import { h } from "hyperapp"

import "./ObjectDetailsPane.scss"

import { ObjectView } from "./ObjectView"

import { State, Actions, Run, AppAction } from "../api"
import { getSelectedAction } from "../selectors"

interface PaneProps {
  state: State
  actions: Actions
  action: AppAction
}

function Pane(props: PaneProps, value: any) {
  const { state, actions, action } = props

  function expanded(path: string, expanded?: boolean) {
    if (typeof expanded === "boolean") {
      actions.collapseAppAction({
        actionPath: state.selectedAction.path,
        run: state.selectedAction.run,
        appActionPath: path,
        collapsed: !expanded
      })
    }

    return !action.stateCollapses[path]
  }

  return (
    <div class="object-details-pane scrollable">
      {ObjectView({ value, expanded })}
    </div>
  )
}

function PaneData(props: PaneProps) {
  return Pane(props, props.action.actionData)
}

function PaneResult(props: PaneProps) {
  return Pane(props, props.action.actionResult)
}

function PaneState(props: PaneProps) {
  return Pane(props, props.action.nextState)
}

function PaneDebuggerState(props: PaneProps) {
  return Pane(props, props.state)
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
