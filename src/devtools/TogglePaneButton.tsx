import { h } from "hyperapp"

import { State, Actions } from "./api"

import "./TogglePaneButton.scss"

export interface TogglePaneButtonProps {
  state: State
  actions: Actions
}

export function TogglePaneButton(props: TogglePaneButtonProps) {
  const { state, actions } = props

  return (
    <button
      class="toggle-pane-button"
      onclick={() => actions.showPane(!state.paneShown)}
    >
      Devtools
    </button>
  )
}
