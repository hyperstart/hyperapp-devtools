import { h } from "hyperapp"

import "./RunsPaneItem.scss"

import { State, Actions, Run } from "../api"

export interface RunsPaneItemProps {
  state: State
  actions: Actions
  run: Run
  current: boolean
}

export function RunsPaneItem(props: RunsPaneItemProps) {
  const { state, actions, run, current } = props
  return <li>Run {run.timestamp}</li>
}
