import { h } from "hyperapp"

import { State, Actions, PaneDisplay } from "./api"

import "./DebugPane.scss"

interface ToolbarProps {
  state: State
  actions: Actions
}

function Toolbar(props: ToolbarProps) {
  const { state, actions } = props
  return (
    <div class="debug-toolbar">
      <div class="dropdown">
        <button class="btn btn-link dropdown-toggle">View</button>
        <ul class="menu">
          <li>
            <a
              href="#"
              class="menu-item"
              onclick={() => actions.setPaneDisplay("fullscreen")}
            >
              Full Screen
            </a>
          </li>
          <li>
            <a
              href="#"
              class="menu-item"
              onclick={() => actions.setPaneDisplay("right")}
            >
              Align Right
            </a>
          </li>
          <li>
            <a
              href="#"
              class="menu-item"
              onclick={() => actions.setPaneDisplay("bottom")}
            >
              Align Bottom
            </a>
          </li>
        </ul>
      </div>
      <span class="float-right">
        <button
          class="btn btn-clear close-button"
          onclick={() => actions.showPane(false)}
        />
      </span>
    </div>
  )
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
