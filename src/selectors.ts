import { State, Run, AppAction } from "./api"
import { get, Path } from "./immutable"

function compareRuns(r1: Run, r2: Run): number {
  return r1.timestamp - r2.timestamp
}

export function getRuns(state: State): Run[] {
  return Object.keys(state.runs)
    .map(key => state.runs[key])
    .sort(compareRuns)
}

export function getSelectedAction(state: State): AppAction | null {
  if (!state.selectedAction) {
    return null
  }

  const { run, path } = state.selectedAction

  return get(state.runs, getPath(run, path))
}

export function getPath(run: string, path: number[]): Path {
  const result: Path = [run]
  path.forEach(index => {
    result.push("actions", index)
  })
  return result
}

export function isSelectedAction(
  state: State,
  run: string,
  path: number[]
): boolean {
  if (!state.selectedAction) {
    return false
  }

  const a = state.selectedAction

  if (run !== a.run) {
    return false
  }

  if (path.length !== a.path.length) {
    return false
  }

  return path.every((val, i) => val === a.path[i])
}

export function canTravelToSelectedAction(state: State, runs: Run[]): boolean {
  const action = state.selectedAction
  if (!action || action.path.length === 0 || runs.length === 0) {
    return false
  }

  // a nested action is selected, so it cannot be the lastest one
  // so we can time travel to it
  if (action.path.length !== 1) {
    return true
  }

  // get last run
  const run = runs[runs.length - 1]
  if (run.actions.length === 0 || action.run !== run.id) {
    return false
  }

  // we can time travel if not the latest action selected
  return run.actions.length - 1 !== action.path[0]
}
