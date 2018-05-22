import { h } from "hyperapp"

import { ObjectView } from "./ObjectView"
import { State, Actions, Run, AppEvent } from "../api"
import { getSelectedEvent, isValueDisplayExpanded } from "../selectors"
import { CallOverviewDetailsPane } from "./CallOverviewDetailsPane"

import "./ObjectDetailsPane.scss"

interface PaneProps {
  state: State
  actions: Actions
  event: AppEvent
}

function Pane(props: PaneProps, value: any) {
  const { state, actions, event } = props

  function expanded(path: string, expanded?: boolean) {
    const result = isValueDisplayExpanded(state, path)
    if (typeof expanded === "boolean") {
      actions.setDetailsPaneExpanded({
        expanded: !result,
        path
      })
    }

    return result
  }

  return (
    <div class="object-details-pane scrollable">
      {ObjectView({ value, expanded })}
    </div>
  )
}

function ErrorPane(props: PaneProps, error: any) {
  if (error instanceof Error) {
    return (
      <div class="object-details-pane scrollable">
        <pre>{error.stack}</pre>
      </div>
    )
  }
  if (typeof error === "string") {
    return (
      <div class="object-details-pane scrollable">
        <pre>{error}</pre>
      </div>
    )
  }
  return Pane(props, error)
}

function PaneData(props: PaneProps) {
  const event = props.event
  if (event.type === "action") {
    return Pane(props, event.data)
  }
  throw new Error(`Expected action event but got: ${event.type}`)
}

function PaneResult(props: PaneProps) {
  const event = props.event
  if (event.type === "action") {
    if (event.error) {
      return ErrorPane(props, event.error)
    }
    return Pane(props, event.result)
  }
  if (event.type === "function") {
    if (event.error) {
      return ErrorPane(props, event.error)
    }
    return Pane(props, event.result)
  }
  throw new Error(`Expected action or function event but got: ${event.type}`)
}

function PaneState(props: PaneProps) {
  const event = props.event
  if (event.type === "action") {
    return Pane(props, event.stateAfter)
  }
  if (event.type === "init") {
    return Pane(props, event.state)
  }
  throw new Error(`Expected action or init event but got: ${event.type}`)
}

function PaneArgs(props: PaneProps) {
  const event = props.event
  if (event.type === "function") {
    return Pane(props, event.args)
  }
  throw new Error(`Expected function event but got: ${event.type}`)
}

function PaneMessage(props: PaneProps) {
  const event = props.event
  if (event.type === "message") {
    return Pane(props, event.message)
  }
  throw new Error(`Expected message event but got: ${event.type}`)
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
  const event = getSelectedEvent(props.state)
  switch (props.state.valueDisplay) {
    case "args":
      return PaneArgs({ state, actions, event })
    case "data":
      return PaneData({ state, actions, event })
    case "result":
      return PaneResult({ state, actions, event })
    case "message":
      return PaneMessage({ state, actions, event })
    case "state":
      return PaneState({ state, actions, event })
    case "call-overview":
      return CallOverviewDetailsPane({ state, actions, event: event as any })
    case "debugger-state":
      return PaneDebuggerState({ state, actions, event })
  }
}
