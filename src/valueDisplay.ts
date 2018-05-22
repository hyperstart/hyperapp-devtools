import { AppEvent, StringMap, ValueDisplay } from "./api"

interface AllowedValueDisplays {
  [eventType: string]: StringMap<boolean>
}

const ALLOWED_VALUE_DISPLAY: AllowedValueDisplays = {
  action: {
    state: true,
    result: true,
    data: true,
    "call-overview": true,
    "debugger-state": true
  },
  function: {
    args: true,
    result: true,
    "call-overview": true,
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

export const VALUE_DISPLAYS: StringMap<string[]> = {
  action: ["state", "call-overview", "result", "data", "debugger-state"],
  function: ["call-overview", "args", "result", "debugger-state"],
  init: ["state", "debugger-state"],
  message: ["message", "debugger-state"]
}

const DEFAULT_VALUE_DISPLAYS: StringMap<ValueDisplay> = {
  action: "state",
  function: "call-overview",
  init: "state",
  message: "message"
}

export function sanitizeValueDisplay(
  valueDisplay: ValueDisplay,
  event: AppEvent
): ValueDisplay {
  if (!ALLOWED_VALUE_DISPLAY[event.type][valueDisplay]) {
    return DEFAULT_VALUE_DISPLAYS[event.type]
  }

  // for actions with error, select the result to show the error.
  if (valueDisplay === "state" && event["error"]) {
    return "result"
  }

  return valueDisplay
}
