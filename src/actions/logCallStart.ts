import * as api from "../api"
import { getLatestRunId } from "../selectors"

function getEvent(
  state: api.State,
  run: api.Run,
  payload: api.LogCallStartPayload
): api.AppEvent {
  const { args, eventId, name, runId, type } = payload
  if (type === "action") {
    return {
      type: "action",
      id: eventId,
      name,
      data: args && args.length > 0 ? args[0] : undefined,
      parent: run.currentEvent,
      children: [],
      collapsed: false,
      stateBefore: run.currentState
    }
  }

  return {
    type: "function",
    id: eventId,
    name,
    args,
    children: [],
    collapsed: false,
    parent: run.currentEvent
  }
}

export const logCallStart = (payload: api.LogCallStartPayload) => (
  state: api.State
): Partial<api.State> => {
  const { runId = getLatestRunId(state), eventId } = payload
  const runsById = { ...state.runsById }
  const run = { ...runsById[runId] }
  runsById[runId] = run
  run.eventsById[eventId] = getEvent(state, run, payload)
  const parentId = run.currentEvent
  if (parentId) {
    // append the event to the parent
    const parent = { ...run.eventsById[parentId] }
    run.eventsById[parentId] = parent
    parent.children = parent.children.concat(eventId)
  } else {
    // append the event to the run
    run.events = run.events.concat(eventId)
  }
  run.currentEvent = eventId

  return { runsById }
}
