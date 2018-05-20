import { AppEvent, State, Run, SelectedEvent } from "./api"
import { get, Path } from "./immutable"

export function isValueDisplayExpanded(state: State, path: string): boolean {
  const expanded = state.detailsPaneExpandedPaths[path]
  if (typeof expanded === "boolean") {
    return expanded
  }
  return path.split(".").length < 4
}

export function getRun(state: State, runId: string): Run | null {
  return state.runsById[runId] || null
}

export function isSelectedEvent(state: State, event: AppEvent): boolean {
  const selected = state.selectedEvent
  if (!selected || !event) {
    return false
  }
  const run = state.runsById[selected.runId]
  return run && run.eventsById[selected.eventId] === event
}

export function getSelectedEvent(
  state: State,
  event: SelectedEvent = state.selectedEvent
): AppEvent | null {
  if (!event) {
    return null
  }

  return state.runsById[event.runId].eventsById[event.eventId]
}

export function getLatestRun(state: State): Run | null {
  if (state.runs.length === 0) {
    return null
  }

  return state.runsById[state.runs.length - 1]
}

export function canTravelToSelectedEvent(state: State): boolean {
  const run = getLatestRun(state)
  const event = getSelectedEvent(state)
  if (!run || !event || event.type !== "action") {
    return false
  }

  return event.stateAfter && event.stateAfter !== run.currentState
}
