import * as api from "../api"

export const setPaneDisplay = (paneDisplay: api.PaneDisplay) => (
  state: api.State
): Partial<api.State> => ({
  paneDisplay
})
