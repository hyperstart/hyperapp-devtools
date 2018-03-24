import { h } from "hyperapp"

import { State, Actions } from "./api"

import { DebugPane } from "./DebugPane"
import { TogglePaneButton } from "./TogglePaneButton"

const style = {
  position: "fixed",
  top: 0,
  left: 0,
  height: "100vh",
  width: "100vw",
  "z-index": 10
}

export function view(state: State, actions: Actions) {
  if (state.paneShown) {
    return (
      <div style={style}>
        {DebugPane({ state, actions })}
        {TogglePaneButton({ state, actions })}
      </div>
    )
  }
  return TogglePaneButton({ state, actions })
}
