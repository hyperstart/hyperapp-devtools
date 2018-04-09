import { ActionsType } from "hyperapp"
import { get, merge, set } from "./immutable"

import * as api from "./api"

function mergeResult(state: any, event: api.ActionEvent): any {
  if (event && event.result) {
    const action = event.action.split(".")
    action.pop()
    return merge(state, action, event.result)
  }
  return state
}

function isCurrentAction(action: api.AppAction): boolean {
  if (action.done) {
    return false
  }

  const length = action.actions.length
  return length === 0 || action.actions[length - 1].done
}

/**
 * Recursively goes down the tree of actions and append the given event to the last non-done action.
 */
function appendActionEvent(
  action: api.AppAction,
  event: api.ActionEvent
): api.AppAction {
  if (action.done) {
    return action
  }

  // no nested action yet
  if (isCurrentAction(action)) {
    if (!event.callDone) {
      // the action calls to a nested action
      const nestedAction: api.AppAction = {
        name: event.action,
        done: false,
        collapsed: false,
        actionData: event.data,
        actions: [],
        previousState: action.previousState
      }

      return {
        ...action,
        actions: action.actions.concat(nestedAction)
      }
    } else if (action.name === event.action) {
      // the previous call is now complete: set to done and compute the result
      return {
        ...action,
        done: true,
        actionResult: event.result,
        nextState: mergeResult(action.previousState, event)
      }
    } else {
      // error case
      console.log("Previous action is done and event.callDone", action, event)
      // TODO what to return?!
      return action
    }
  } else {
    // there are already some nested actions: call recursivelly
    const nested = action.actions
    const nestedAction = nested[nested.length - 1]
    const newNestedAction = appendActionEvent(nestedAction, event)
    if (nestedAction === newNestedAction) {
      return action
    }
    return {
      ...action,
      actions: nested.slice(0, nested.length - 1).concat(newNestedAction)
    }
  }
}

function toggleAction(
  runs: api.Runs,
  runId: string,
  actionPath: number[]
): api.Runs {
  const path: any[] = [runId]
  actionPath.forEach(index => {
    path.push("actions", index)
  })
  path.push("collapsed")

  const collapsed = get(runs, path)
  if (typeof collapsed !== "boolean") {
    console.log("WARN: try to collapse invalid action, path: ", actionPath)
    return runs
  }

  return set(runs, path, !collapsed)
}

export const INITIAL_ACTION = "%%% INITIAL STATE %%%"

export const actions: ActionsType<api.State, api.Actions> = {
  log: (event: api.RuntimeEvent) => state => {
    return { logs: state.logs.concat([event]) }
  },
  logInit: (event: api.InitEvent) => state => {
    const runs = { ...state.runs }

    const action: api.AppAction = {
      name: INITIAL_ACTION,
      done: true,
      collapsed: false,
      actions: [],
      previousState: null,
      nextState: event.state
    }

    runs[event.runId] = {
      id: event.runId,
      timestamp: event.timestamp,
      actions: [action],
      collapsed: false
    }

    return { runs, selectedAction: action }
  },
  logAction: (event: api.ActionEvent) => state => {
    const runs = { ...state.runs }
    const run = runs[event.runId]
    const actions = [...run.actions]
    run.actions = actions
    const prevAction = actions.pop()
    let selectedAction: api.AppAction
    if (prevAction.done) {
      // previous action done: create new action and append
      if (!event.callDone) {
        selectedAction = {
          done: false,
          collapsed: false,
          actions: [],
          name: event.action,
          actionData: event.data,
          previousState: prevAction.nextState
        }

        actions.push(prevAction, selectedAction)
      } else {
        // error!, should we log it here?
        console.log("Previous action is done and event.callDone", state, event)
      }
    } else {
      // previous action not done: find parent action, create and append
      selectedAction = appendActionEvent(prevAction, event)
      actions.push(selectedAction)
    }

    return { runs, selectedAction }
  },
  toggleRun: (id: string) => state => {
    const runs = { ...state.runs }
    runs[id] = { ...runs[id], collapsed: !runs[id].collapsed }
    return { runs }
  },
  toggleAction: (payload: api.ToggleActionPayload) => state => {
    const { run, path } = payload
    const runs = toggleAction(state.runs, run, path)
    return { runs }
  },
  select: (selectedAction: api.AppAction | null) => {
    return { selectedAction }
  },
  showPane: (paneShown: boolean) => {
    return { paneShown }
  },
  setPaneDisplay: (paneDisplay: api.PaneDisplay) => {
    return { paneDisplay }
  },
  setValueDisplay: (valueDisplay: api.ValueDisplay) => {
    return { valueDisplay }
  },
  toggleCollapseRepeatingActions: () => state => {
    return { collapseRepeatingActions: !state.collapseRepeatingActions }
  },
  deleteRun: (id: string) => state => {
    const runs = { ...state.runs }
    delete runs[id]
    return { runs }
  }
}
