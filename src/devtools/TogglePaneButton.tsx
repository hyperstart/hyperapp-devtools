import { h } from "hyperapp"

import { State, Actions } from "./api"

export interface TogglePaneButtonProps {
  state: State
  actions: Actions
}

const style: any = {
  position: "fixed",
  right: "2%",
  bottom: "2%",
  "border-radius": "0px",
  border: "1px solid black",
  color: "black",
  background: "white",
  margin: "0.2rem",
  outline: "none",
  "font-size": "2rem"
}

export function TogglePaneButton(props: TogglePaneButtonProps) {
  const { state, actions } = props

  return (
    <button style={style} onclick={() => actions.showPane(!state.paneShown)}>
      Debug
    </button>
  )
}
