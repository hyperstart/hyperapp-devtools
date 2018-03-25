import { h } from "hyperapp"

import "./RunsPane.scss"

import { State, Actions, Run } from "../api"
import { RunsPaneItem } from "./RunsPaneItem"

export interface RunsPaneProps {
  state: State
  actions: Actions
  runs: Run[]
}

export function RunsPane(props: RunsPaneProps) {
  const { state, actions, runs } = props
  const items = []
  const lastId = runs.length - 1
  runs.forEach((run, i) => {
    items.unshift(RunsPaneItem({ state, actions, run, current: i === lastId }))
  })
  return (
    <div class="scrollable">
      <ul class="scrollable-content">{runs}</ul>
    </div>
  )
}
