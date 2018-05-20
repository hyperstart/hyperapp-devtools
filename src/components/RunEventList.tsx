import { h } from "hyperapp"

import { State, Actions, Run } from "../api"
import { RunEvent } from "./RunEvent"

import "./RunEventList.scss"

// # Component

export interface RunEventListProps {
  state: State
  actions: Actions
  run: Run
  events: string[]
}

export function RunEventList(props: RunEventListProps) {
  const { state, actions, run, events } = props
  if (events.length === 0) {
    return null
  }

  return (
    <ul class="run-event-list">
      {events
        .map((event, indexInList) => {
          return RunEvent({
            state,
            actions,
            events: run.events,
            event: run.eventsById[event],
            indexInList,
            run
          })
        })
        .reverse()}
    </ul>
  )
}
