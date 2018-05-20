import * as api from "../api"

export const toggleCollapseRepeatingEvents = () => (
  state: api.State
): Partial<api.State> => ({
  collapseRepeatingEvents: !state.collapseRepeatingEvents
})
