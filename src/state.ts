import { State } from "./api"

export const state: State = {
  runs: [],
  runsById: {},
  paneDisplay: "right",
  valueDisplay: "state",
  paneShown: false,
  selectedEvent: null,
  collapseRepeatingEvents: true,
  detailsPaneExpandedPaths: {}
}
