import { h } from "hyperapp"

import "./ObjectDetailsPane.scss"

import { State, Actions, Run } from "../api"

export interface ObjectDetailsPaneProps {
  state: State
  actions: Actions
}

export function ObjectDetailsPane(props: ObjectDetailsPaneProps) {
  const { state, actions } = props
  return (
    <div class="object-details-pane scrollable">
      <pre class="scrollable-content">{JSON.stringify(state, null, 2)}</pre>
    </div>
  )
}
