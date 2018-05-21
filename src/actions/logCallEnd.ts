import * as api from "../api"
import { merge } from "../immutable"
import { getLatestRunId } from "../selectors"
import { sanitizeValueDisplay } from "../valueDisplay"

export const logCallEnd = (payload: api.LogCallEndPayload) => (
  state: api.State
): Partial<api.State> => {
  const { runId = getLatestRunId(state), eventId, result, error } = payload

  const runsById = { ...state.runsById }
  const run = { ...runsById[runId] }
  runsById[runId] = run

  run.eventsById = { ...run.eventsById }
  const event = { ...run.eventsById[eventId] }
  run.eventsById[eventId] = event
  let valueDisplay = state.valueDisplay
  // update the event
  if (event.type === "action" || event.type === "function") {
    if (result) {
      event.result = result

      if (event.type === "action" && !result.then) {
        // update the run's current state
        const path = event.name.split(".")
        path.pop()
        const stateAfter = merge(event.stateBefore, path, event.result)
        event.stateAfter = stateAfter
        run.currentState = stateAfter
      }
    }
    if (error) {
      event.error = error
    }
  }

  // update the current event of the run
  run.currentEvent =
    eventId === run.currentEvent ? event.parent : run.currentEvent

  const selectedEvent: api.SelectedEvent = {
    runId: run.id,
    eventId
  }

  valueDisplay = sanitizeValueDisplay(valueDisplay, event)

  return { runsById, selectedEvent, valueDisplay }
}
