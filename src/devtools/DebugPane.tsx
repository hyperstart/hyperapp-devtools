import { h } from "hyperapp"

import { State, Actions } from "./api"

import "./DebugPane.scss"

interface ToolbarProps {
  state: State
  actions: Actions
}

function Toolbar(props: ToolbarProps) {
  return <div class="debug-toolbar">&nbsp;Devtools</div>
}

export interface DebugPaneProps {
  state: State
  actions: Actions
}

export function DebugPane(props: DebugPaneProps) {
  const { state, actions } = props

  return (
    <div class="debug-pane">
      {Toolbar({ state, actions })}
      <div class="debug-content scrollable">
        <pre class="scrollable-content">{JSON.stringify(state, null, 2)}</pre>
      </div>
    </div>
  )
}
