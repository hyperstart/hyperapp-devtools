import { AppEvent, State, Run, SelectedEvent } from "./api"
import { get, Path } from "./immutable"

export function isValueDisplayExpanded(state: State, path: string): boolean {
  const expanded = state.detailsPaneExpandedPaths[path]
  if (typeof expanded === "boolean") {
    return expanded
  }
  return path.split(".").length < 4
}

export function getLatestRunId(state: State): string {
  const runs = state.runs
  if (runs.length > 0) {
    return runs[runs.length - 1]
  }
  throw new Error("No run found.")
}

export function getRun(state: State, runId: string): Run {
  const run = state.runsById[runId]
  if (!run) throw new Error(`No run with id =${runId}`)
  return run
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

export function getLatestRun(state: State): Run {
  return state.runsById[getLatestRunId(state)]
}

export function canTravelToSelectedEvent(state: State): boolean {
  const run = getLatestRun(state)
  const event = getSelectedEvent(state)
  if (!run || !event) {
    return false
  }

  if (event.type === "action") {
    return event.stateAfter && event.stateAfter !== run.currentState
  }
  if (event.type === "init") {
    return event.state !== run.currentState
  }
  return false
}
