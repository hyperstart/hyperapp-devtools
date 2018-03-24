import { h } from "hyperapp"

import { State, Actions } from "./api"

export interface DebugPaneProps {
  state: State
  actions: Actions
}

export function DebugPane(props: DebugPaneProps) {
  const { state, actions } = props
  return <pre>{JSON.stringify(state, null, 2)}</pre>
}
