import { h } from "hyperapp"

import "./RunsPaneItem.scss"

import { State, Actions, Run } from "../api"
import { RunActionItemList } from "./RunActionItemList"

export interface RunsPaneItemProps {
  state: State
  actions: Actions
  run: Run
  current: boolean
  path: any[]
}

export function RunsPaneItem(props: RunsPaneItemProps) {
  const { state, actions, run, current, path } = props
  const date = new Date(run.timestamp).toLocaleTimeString()
  const collapsed = run.collapsed

  return (
    <li class="run-pane-item" key={run.timestamp}>
      <h6>Run - {date}</h6>
      {RunActionItemList({
        state,
        actions,
        run,
        collapsed,
        actionList: run.actions,
        path: []
      })}
    </li>
  )
}
