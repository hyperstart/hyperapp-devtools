import { State } from "./api"

export const state: State = {
  runs: {},
  logs: [],
  paneDisplay: "fullscreen",
  paneShown: false,
  selectedAction: null,
  collapseRepeatingActions: true,
  showFullState: true
}
