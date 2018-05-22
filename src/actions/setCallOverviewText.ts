import * as api from "../api"

export const setCallOverviewText = (callOverviewText: string) => (
  state: api.State
): Partial<api.State> => {
  return { callOverviewText }
}
