import * as api from "../api"

export const showPane = (paneShown: boolean) => (
  state: api.State
): Partial<api.State> => ({
  paneShown
})
