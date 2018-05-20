import * as api from "../api"

export const logInit = (payload: api.LogInitPayload) => (
  state: api.State
): Partial<api.State> => {
  const { runId, interop, timestamp } = payload
  const runs = state.runs.concat(runId)
  const runsById = { ...state.runsById }
  const initEvent: api.InitEvent = {
    id: runId,
    type: "init",
    name: "Initial State",
    state: payload.state
  }
  runsById[runId] = {
    id: runId,
    events: [runId],
    eventsById: { [runId]: initEvent },
    currentState: payload.state,
    timestamp,
    interop,
    collapsed: false
  }
  return {
    runs,
    runsById,
    selectedEvent: {
      runId,
      eventId: runId
    }
  }
}
