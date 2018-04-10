import { State, Run, AppAction } from "./api"
import { get, Path } from "./immutable";

function compareRuns(r1: Run, r2: Run): number {
  return r1.timestamp - r2.timestamp
}

export function getRuns(state: State): Run[] {
  return Object.keys(state.runs)
    .map(key => state.runs[key])
    .sort(compareRuns)
}

export function getSelectedAction(state: State): AppAction | null {
  if(!state.selectedAction) {
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

export function isSelectedAction(state: State, run: string, path: number[]): boolean {
  if(!state.selectedAction) {
    return false
  }

  const a = state.selectedAction

  if(run !== a.run) {
    return false
  }

  if(path.length !== a.path.length) {
    return false
  }

  return path.every((val, i) => val === a.path[i])
}
