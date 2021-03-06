import { h } from "hyperapp"

import "./RunsPaneItem.scss"

import { State, Actions, Run } from "../api"
import { RunEventList } from "./RunEventList"

export interface RunsPaneItemProps {
  state: State
  actions: Actions
  run: Run
  current: boolean
}

export function RunsPaneItem(props: RunsPaneItemProps) {
  const { state, actions, run, current } = props
  const date = new Date(run.timestamp).toLocaleTimeString()
  const collapsed = run.collapsed

  return (
    <li class="run-pane-item" key={run.timestamp}>
      <h2>Run - {date}</h2>
      {!collapsed &&
        RunEventList({
          run,
          state,
          actions,
          events: run.events
        })}
    </li>
  )
}
