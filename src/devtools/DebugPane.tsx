import { h } from "hyperapp"

import { State, Actions } from "./api"

export interface DebugPaneProps {
  state: State
  actions: Actions
  style?: any
}

const defaultStyle: any = {
  width: "96%",
  height: "96%",
  background: "#EEEEEE",
  border: "1px solid black",
  color: "black",
  position: "fixed",
  left: "2%",
  top: "2%",
  valign: "center"
}

export function DebugPane(props: DebugPaneProps) {
  const { state, actions, style = defaultStyle } = props

  return <div style={style}>{JSON.stringify(state, null, 2)}</div>
}
