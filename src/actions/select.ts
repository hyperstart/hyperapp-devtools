import * as api from "../api"
import { getSelectedEvent } from "../selectors"

interface AllowedValueDisplays {
  [eventType: string]: api.StringMap<boolean>
}

const ALLOWED_VALUE_DISPLAY: AllowedValueDisplays = {
  action: {
    state: true,
    result: true,
    data: true,
    "debugger-state": true
  },
  function: {
    args: true,
    result: true,
    "debugger-state": true
  },
  init: {
    state: true,
    "debugger-state": true
  },
  message: {
    message: true,
    "debugger-state": true
  }
}

const DEFAULT_VALUE_DISPLAYS: api.StringMap<api.ValueDisplay> = {
  action: "state",
  function: "result",
  init: "state",
  message: "message"
}

function sanitizeValueDisplay(
  valueDisplay: api.ValueDisplay,
  event: api.AppEvent
): api.ValueDisplay {
  if (!ALLOWED_VALUE_DISPLAY[event.type][valueDisplay]) {
    return DEFAULT_VALUE_DISPLAYS[event.type]
  }

  return valueDisplay
}

export const select = (selectedEvent: api.SelectedEvent | null) => (
  state: api.State
): Partial<api.State> => {
  const event = getSelectedEvent(state, selectedEvent)
  return {
    selectedEvent,
    valueDisplay: sanitizeValueDisplay(state.valueDisplay, event)
  }
}
