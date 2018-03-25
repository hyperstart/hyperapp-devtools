import { h } from "hyperapp"

import { State, Actions, PaneDisplay } from "../api"

import { DebuggerOptions } from "./DebuggerOptions"

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
          <li class="menu-item">
            <a
              href=""
              onclick={e => {
                actions.setPaneDisplay("fullscreen")
                e.preventDefault()
              }}
            >
              Full Screen
            </a>
          </li>
          <li class="menu-item">
            <a
              href=""
              onclick={e => {
                actions.setPaneDisplay("right")
                e.preventDefault()
              }}
            >
              Align Right
            </a>
          </li>
          <li class="menu-item">
            <a
              href=""
              onclick={e => {
                actions.setPaneDisplay("bottom")
                e.preventDefault()
              }}
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
      {DebuggerOptions({ state, actions })}
      <div class="debug-content scrollable">
        <pre class="scrollable-content">{JSON.stringify(state, null, 2)}</pre>
      </div>
    </div>
  )
}
