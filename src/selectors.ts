import { State, Run } from "./api"

function compareRuns(r1: Run, r2: Run): number {
  return r1.timestamp - r2.timestamp
}

export function getRuns(state: State): Run[] {
  return Object.keys(state.runs)
    .map(key => state.runs[key])
    .sort(compareRuns)
}
