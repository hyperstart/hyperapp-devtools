import { h } from "hyperapp"

import "./RunEvent.scss"

import { State, Actions, Run, AppEvent } from "../api"
import { isSelectedEvent } from "../selectors"
import { RunEventList } from "./RunEventList"
import { truncate } from "../utils"
import { Icon } from "./Icon"

// # Helpers

function getRepeatText(run: Run, events: string[], index: number): string {
  const event = run.eventsById[events[index]]
  let result = 1
  let i = index - 1
  while (i >= 0) {
    const previous = run.eventsById[events[i]]
    if (previous.name === event.name && previous.type === event.type) {
      result++
      i--
    } else {
      return result === 1 ? "" : " (x" + result + ")"
    }
  }
  return result === 1 ? "" : " (x" + result + ")"
}

function getArgumentText(arg: any): string {
  if (
    arg &&
    typeof arg === "object" &&
    arg.constructor &&
    arg.constructor.name !== "Object"
  ) {
    return arg.constructor.name
  }
  return JSON.stringify(arg)
}

const MAX_LENGTH = 20

function getArgumentsText(args: any[]): string {
  let result = ""
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    const text = (result +=
      getArgumentText(arg) + (i < args.length - 1 ? ", " : ""))

    if (result.length === MAX_LENGTH) {
      return result
    } else if (result.length > MAX_LENGTH) {
      return result.substring(0, MAX_LENGTH - 3) + "..."
    }
  }
  return result
}

function getDisplayName(event: AppEvent): string {
  switch (event.type) {
    case "init":
      return "Initial State"
    case "action":
      return `${event.name}(${getArgumentsText(
        typeof event.data === "undefined" ? [] : [event.data]
      )})`
    case "function":
      return `f ${event.name}(${getArgumentsText(event.args)})`
    case "message":
      return `[${event.level}] ${truncate(event.message)}`
  }
}

function getEventClass(event: AppEvent): string {
  switch (event.type) {
    case "init":
      return ""
    case "action":
    case "function":
      return event.error ? "error" : ""
    case "message":
      return event.level
  }
}

// # ToggleActionItem

interface ToggleEventProps {
  actions: Actions
  run: Run
  event: AppEvent
}

function ToggleEvent(props: ToggleEventProps) {
  const { actions, run, event } = props

  if (!event.children || event.children.length === 0) {
    return <Icon name="empty" />
  }

  const onclick = (e: Event) => {
    e.stopPropagation()
    e.preventDefault()
    actions.toggleEvent({ runId: run.id, eventId: event.id })
  }

  if (event.collapsed) {
    return <Icon name="caret-right" onclick={onclick} />
  }

  return <Icon name="caret-bottom" onclick={onclick} />
}

interface EventLinkProps {
  state: State
  actions: Actions
  run: Run
  event: AppEvent
  events: string[]
  indexInList: number
}

function EventLink(props: EventLinkProps) {
  const { state, actions, run, events, indexInList, event } = props

  const selected = isSelectedEvent(state, event)
  const className = "item-link" + (selected ? " selected" : "")

  const onclick = e => {
    e.preventDefault()
    actions.select({ runId: run.id, eventId: event.id })
  }

  return (
    <a href="" class={className} onclick={onclick}>
      {ToggleEvent(props)}
      <span class={getEventClass(event)}>{getDisplayName(event)}</span>
      {state.collapseRepeatingEvents && (
        <span class="run-event-count">
          {getRepeatText(run, events, indexInList)}
        </span>
      )}
    </a>
  )
}

// # RunActionItem Component

export interface RunEventProps {
  state: State
  actions: Actions
  run: Run
  event: AppEvent
  events: string[]
  indexInList: number
}

export function RunEvent(props: RunEventProps) {
  const { state, actions, run, events, indexInList, event } = props

  const nextEvent = run.eventsById[events[indexInList + 1]]
  if (
    nextEvent &&
    nextEvent.name === event.name &&
    nextEvent.type === event.type &&
    state.collapseRepeatingEvents
  ) {
    return null
  }

  return (
    <li class="run-event" key={indexInList}>
      {EventLink(props)}
      {event.children &&
        !event.collapsed &&
        RunEventList({
          state,
          actions,
          run,
          events: event.children
        })}
    </li>
  )
}
