import { h } from "hyperapp"

import "./DebugPaneToolbar.scss"

import { State, Actions } from "../api"
import { canTravelToSelectedEvent } from "../selectors"
import { Icon } from "./Icon"

export interface DebugPaneToolbarProps {
  state: State
  actions: Actions
}

export function DebugPaneToolbar(props: DebugPaneToolbarProps) {
  const { state, actions } = props

  return (
    <div class="debug-pane-toolbar">
      <span class="toolbar-section view-buttons">
        <button
          class={state.paneDisplay === "fullscreen" ? "selected" : ""}
          onclick={() => actions.setPaneDisplay("fullscreen")}
        >
          Full Screen
        </button>
        <button
          class={state.paneDisplay === "right" ? "selected" : ""}
          onclick={() => actions.setPaneDisplay("right")}
        >
          Right
        </button>
        <button
          class={state.paneDisplay === "bottom" ? "selected" : ""}
          onclick={() => actions.setPaneDisplay("bottom")}
        >
          Bottom
        </button>
      </span>
      <span class="toolbar-section travel-button">
        <button
          onclick={() => actions.timeTravel(state.selectedEvent)}
          disabled={!canTravelToSelectedEvent(state)}
        >
          Travel to Action
        </button>
      </span>
      <span class="toolbar-section close-button">
        <Icon name="cross" onclick={() => actions.showPane(false)} />
      </span>
    </div>
  )
}
