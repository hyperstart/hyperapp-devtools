import * as api from "../api"

export const logMessage = (payload: api.LogMessagePayload) => (
  state: api.State
): Partial<api.State> => {
  const { runId, eventId, level, message } = payload

  const runsById = { ...state.runsById }
  const run = { ...runsById[runId] }
  runsById[runId] = run
  run.events = run.events.concat(eventId)
  run.eventsById = {
    ...run.eventsById,
    [eventId]: {
      type: "message",
      level,
      message,
      name: level,
      id: eventId,
      parent: run.currentEvent
    }
  }

  return {
    runsById,
    selectedEvent: {
      runId,
      eventId
    }
  }
}
