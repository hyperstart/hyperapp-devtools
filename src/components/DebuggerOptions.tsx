import { h } from "hyperapp"

import "./DebuggerOptions.scss"

import { State, Actions } from "../api"

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
      <div class="option">
        <select
          onchange={e => actions.setValueDisplay(e.target.value)}
          value={state.valueDisplay}
        >
          <option value="state">Show Full State</option>
          <option value="result">Show Action Result</option>
          <option value="data">Show Action Data</option>
          <option value="debugger-state">Show Debugger Own State</option>
        </select>
      </div>
    </div>
  )
}
