import * as api from "../api"
import { get, set } from "../immutable"

export const toggleEvent = (payload: api.ToggleEventPayload) => (
  state: api.State
): Partial<api.State> => {
  const { runId, eventId } = payload

  // const collapsed = state.runsById[runId].eventsById[eventId].collapsed
  const collapsed = get(state.runsById, [
    runId,
    "eventsById",
    eventId,
    "collapsed"
  ])
  // state.runsById[runId].eventsById[eventId].collapsed = !collapsed
  return {
    runsById: set(
      state.runsById,
      [runId, "eventsById", eventId, "collapsed"],
      !collapsed
    )
  }
}
