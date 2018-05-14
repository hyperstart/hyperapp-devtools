import { h } from "hyperapp"

import "./RunActionItem.scss"

import { State, Actions, AppAction, Run } from "../api"
import { INITIAL_ACTION } from "../actions"

import { RunActionItemList } from "./RunActionItemList"
import { isSelectedAction } from "../selectors"
import { Icon } from "./Icon"

// # Helpers

function getRepeatText(array: AppAction[], index: number): string {
  const name = array[index].name
  let result = 1
  let i = index - 1
  while (i >= 0) {
    if (name === array[i].name) {
      result++
      i--
    } else {
      return result === 1 ? "" : " (x" + result + ")"
    }
  }
  return result === 1 ? "" : " (x" + result + ")"
}

function getActionDataText(action: AppAction): string {
  if (typeof action.actionData === "undefined") {
    return ""
  }
  try {
    const result = JSON.stringify(action.actionData)
    if (result && result.length > 20) {
      return result.substr(0, 17) + "..."
    }
    return result || ""
  } catch (e) {
    console.log(e)
    return "error"
  }
}

// # ToggleActionItem

interface ToggleActionItemProps {
  actions: Actions
  run: Run
  action: AppAction
  path: number[]
}

function ToggleActionItem(props: ToggleActionItemProps) {
  const { action, run, actions, path } = props

  if (action.actions.length === 0) {
    return <Icon name="empty" />
  }

  const onclick = (e: Event) => {
    event.stopPropagation()
    event.preventDefault()
    actions.toggleAction({ run: run.id, path })
  }

  if (action.collapsed) {
    return <Icon name="caret-right" onclick={onclick} />
  }

  return <Icon name="caret-bottom" onclick={onclick} />
}

// # ActionItemLink

interface ActionItemLinkProps {
  state: State
  actions: Actions
  run: Run
  actionList: AppAction[]
  indexInList: number
  action: AppAction
  path: number[]
}

function ActionItemLink(props: ActionItemLinkProps) {
  const { state, actions, run, actionList, indexInList, action, path } = props

  const selected = isSelectedAction(state, run.id, path)
  const className = "item-link" + (selected ? " selected" : "")

  const onclick = (e: Event) => {
    e.preventDefault()
    actions.select({ run: run.id, path })
  }

  const displayName =
    action.name === INITIAL_ACTION
      ? " Initial State"
      : ` ${action.name}(${getActionDataText(action)})`
  return (
    <a href="" class={className} onclick={onclick}>
      {ToggleActionItem(props)}
      {displayName}
      {state.collapseRepeatingActions && (
        <span class="run-action-item-count">
          {getRepeatText(actionList, indexInList)}
        </span>
      )}
    </a>
  )
}

// # RunActionItem Component

export interface RunActionItemProps {
  state: State
  actions: Actions
  run: Run
  actionList: AppAction[]
  indexInList: number
  action: AppAction
  path: number[]
}

export function RunActionItem(props: RunActionItemProps) {
  const { state, actions, run, actionList, indexInList, action, path } = props

  const nextAction = actionList[indexInList + 1]
  if (
    nextAction &&
    nextAction.name === action.name &&
    state.collapseRepeatingActions
  ) {
    return null
  }

  return (
    <li class="run-action-item" key={indexInList}>
      {ActionItemLink(props)}
      {RunActionItemList({
        state,
        actions,
        run,
        actionList: action.actions,
        path,
        collapsed: action.collapsed
      })}
    </li>
  )
}
