import * as api from "../api"
import { getSelectedEvent } from "../selectors"
import { sanitizeValueDisplay } from "../valueDisplay"

export const select = (selectedEvent: api.SelectedEvent | null) => (
  state: api.State
): Partial<api.State> => {
  const event = getSelectedEvent(state, selectedEvent)
  return {
    selectedEvent,
    valueDisplay: sanitizeValueDisplay(state.valueDisplay, event)
  }
}
