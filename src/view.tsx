import { h } from "hyperapp"

import { State, Actions, PaneDisplay } from "./api"
import { DebugPane, TogglePaneButton } from "./components"

function getClassName(display: PaneDisplay): string {
  switch (display) {
    case "fullscreen":
      return "devtools-overlay"
    case "right":
      return "devtools-overlay align-right"
    case "bottom":
      return "devtools-overlay align-bottom"
  }
}

export function view(state: State, actions: Actions) {
  if (state.paneShown) {
    return (
      <div class={getClassName(state.paneDisplay)}>
        {DebugPane({ state, actions })}
        {TogglePaneButton({ state, actions })}
      </div>
    )
  }
  return TogglePaneButton({ state, actions })
}
