import * as api from "../api"

export const setValueDisplay = (valueDisplay: api.ValueDisplay) => (
  state: api.State
): Partial<api.State> => ({
  valueDisplay
})
