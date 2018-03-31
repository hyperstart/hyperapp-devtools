import { h } from "hyperapp"

import "./RunActionItem.scss"

import { State, Actions, AppAction, Run } from "../api"

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
      return "(x" + result + ")"
    }
  }
  return "(x" + result + ")"
}

function getActionDataText(action: AppAction): string {
  if (typeof action.actionData === "undefined") {
    return ""
  }
  try {
    const result = JSON.stringify(action.actionData)
    if (result.length > 20) {
      return result.substr(0, 17) + "..."
    }
    return result
  } catch (e) {
    console.log(e)
    return "error"
  }
}

// # Nested Actions Component

interface RunActionNestedActionsProps {
  state: State
  actions: Actions
  action: AppAction
}

function RunActionNestedActions(props: RunActionNestedActionsProps) {
  const { state, actions, action } = props
  if (action.collapsed || action.nestedActions.length === 0) {
    return null
  }
  return (
    <ul class="run-action-item-nested-actions">
      {action.nestedActions
        .map((a, index) => {
          return RunActionItem({
            state,
            actions,
            array: action.nestedActions,
            action: a,
            index
          })
        })
        .reverse()}
    </ul>
  )
}

// # RunActionItem Component

export interface RunActionItemProps {
  state: State
  actions: Actions
  array: AppAction[]
  index: number
  action: AppAction
}

export function RunActionItem(props: RunActionItemProps) {
  const { state, actions, array, index, action } = props

  const nextAction = array[index + 1]
  if (
    nextAction &&
    nextAction.name === action.name &&
    state.collapseRepeatingActions
  ) {
    return null
  }

  const onclick = (e: Event) => {
    e.preventDefault()
    actions.select(action)
  }

  return (
    <li key={index}>
      <a href="" class="run-action-item" onclick={onclick}>
        {action.name}({getActionDataText(action)}){" "}
        {state.collapseRepeatingActions && (
          <span class="run-action-item-count">
            {getRepeatText(array, index)}
          </span>
        )}
      </a>
      {RunActionNestedActions({ state, actions, action })}
    </li>
  )
}
