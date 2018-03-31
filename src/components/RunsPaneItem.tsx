import { h } from "hyperapp"

import "./RunsPaneItem.scss"

import { State, Actions, Run } from "../api"
import { RunActionItem } from "./RunActionItem"

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

  const items = collapsed
    ? []
    : run.actions
        .map((action, index) => {
          return RunActionItem({
            state,
            actions,
            array: run.actions,
            action,
            index
          })
        })
        .reverse()

  return (
    <li class="run-pane-item" key={run.timestamp}>
      Run - {date}
      <ul>{items}</ul>
    </li>
  )
}
