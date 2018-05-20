import * as api from "../api"

export const toggleRun = (id: string) => (state: api.State) => {
  const runsById = { ...state.runsById }
  runsById[id] = { ...runsById[id], collapsed: !runsById[id].collapsed }
  return { runsById }
}
