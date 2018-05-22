import { h } from "hyperapp"

import "./DebuggerOptions.scss"

import { State, Actions, StringMap } from "../api"
import { getSelectedEvent } from "../selectors"
import { VALUE_DISPLAYS } from "../valueDisplay"

const LABELS: StringMap<string> = {
  state: "Show full state",
  result: "Show action or function result",
  args: "Show function arguments",
  message: "Show message",
  data: "Show action data",
  "call-overview": "Overview of the call",
  "debugger-state": "Show debugger full state (for debug only)"
}

function ValueDisplaySelect(props: DebuggerOptionsProps) {
  const { state, actions } = props
  const event = getSelectedEvent(state)

  return (
    <select
      onchange={e => actions.setValueDisplay(e.target.value)}
      value={state.valueDisplay}
    >
      {VALUE_DISPLAYS[event.type].map(value => (
        <option value={value}>{LABELS[value]}</option>
      ))}
    </select>
  )
}

export interface DebuggerOptionsProps {
  state: State
  actions: Actions
}

export function DebuggerOptions(props: DebuggerOptionsProps) {
  const { state, actions } = props

  return (
    <div class="debugger-options">
      <div class="option">
        <input
          id="debugger-group-actions-cb"
          type="checkbox"
          checked={state.collapseRepeatingEvents}
          onchange={actions.toggleCollapseRepeatingEvents}
        />
        <label for="debugger-group-actions-cb">Group repeating actions</label>
      </div>
      <div class="option">{ValueDisplaySelect(props)}</div>
    </div>
  )
}
