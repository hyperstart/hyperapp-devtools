import { h } from "hyperapp"

import "./RunActionItemList.scss"

import { State, Actions, AppAction, Run } from "../api"
import { INITIAL_ACTION } from "../actions"

import { RunActionItem } from "./RunActionItem"

// # Component

export interface RunActionItemListProps {
  state: State
  actions: Actions
  run: Run
  actionList: AppAction[]
  collapsed: boolean
  path: number[]
}

export function RunActionItemList(props: RunActionItemListProps) {
  const { state, actions, run, actionList, collapsed, path } = props
  if (collapsed || actionList.length === 0) {
    return null
  }

  return (
    <ul class="run-action-item-list">
      {actionList
        .map((action, indexInList) => {
          return RunActionItem({
            state,
            actions,
            action,
            actionList,
            indexInList,
            run,
            path: path.concat(indexInList)
          })
        })
        .reverse()}
    </ul>
  )
}
