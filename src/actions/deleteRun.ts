import * as api from "../api"

export const deleteRun = (id: string) => (
  state: api.State
): Partial<api.State> => {
  const runsById = { ...state.runsById }
  delete runsById[id]
  const runs = state.runs.filter(s => s !== id)
  return { runs, runsById }
}
