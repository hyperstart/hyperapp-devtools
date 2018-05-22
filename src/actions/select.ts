import * as api from "../api"
import { getSelectedEvent, getCallText } from "../selectors"
import { sanitizeValueDisplay } from "../valueDisplay"

function getCallOverviewText(state: api.State, event: api.AppEvent): string {
  if (event.type === "action" || event.type === "function") {
    return getCallText(event)
  }
  return state.callOverviewText
}

export const select = (selectedEvent: api.SelectedEvent | null) => (
  state: api.State
): Partial<api.State> => {
  const event = getSelectedEvent(state, selectedEvent)

  return {
    selectedEvent,
    valueDisplay: sanitizeValueDisplay(state.valueDisplay, event),
    callOverviewText: getCallOverviewText(state, event)
  }
}
