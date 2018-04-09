import { h } from "hyperapp"

import "./DebugPaneToolbar.scss"

import { State, Actions } from "../api"

export interface DebugPaneToolbarProps {
  state: State
  actions: Actions
}

export function DebugPaneToolbar(props: DebugPaneToolbarProps) {
  const { state, actions } = props
  return (
    <div class="debug-pane-toolbar">
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
