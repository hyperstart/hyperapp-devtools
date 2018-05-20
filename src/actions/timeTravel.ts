import * as api from "../api"
import { getSelectedEvent, getRun } from "../selectors"

export const timeTravel = (selectedEvent: api.SelectedEvent) => (
  state: api.State
) => {
  const run = getRun(state, selectedEvent.runId)
  if (!run) {
    return
  }

  const event = getSelectedEvent(state, selectedEvent)
  if (event) {
    if (event.type === "action" && event.stateAfter) {
      run.interop[api.injectedSetState](event.stateAfter)
      return
    }
    if (event.type === "init") {
      run.interop[api.injectedSetState](event.state)
    }
  }
}
