import * as api from "../api"
import { set } from "../immutable"

export const setDetailsPaneExpanded = (
  payload: api.SetDetailsPaneExpandedPayload
) => (state: api.State): Partial<api.State> => {
  const { path, expanded } = payload
  return {
    detailsPaneExpandedPaths: {
      ...state.detailsPaneExpandedPaths,
      [path]: expanded
    }
  }
}
