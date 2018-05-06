import { ActionsType } from "hyperapp"
import { get, merge, set } from "./immutable"
import { getPath } from "./selectors"

import * as api from "./api"

function getPreviousState(action: api.AppAction): any {
  if (action.actions.length > 0) {
    const child = action.actions[action.actions.length - 1]
    return child.done ? child.nextState : child.previousState
  }

  return action.previousState
}

function mergeResult(action: api.AppAction, event: api.ActionEvent): any {
  if (event && event.result) {
    const path = event.action.split(".")
    path.pop()
    return merge(getPreviousState(action), path, event.result)
  }

  return getPreviousState(action)
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
        previousState: action.previousState,
        stateCollapses: {}
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
        nextState: mergeResult(action, event)
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
  state: api.State,
  run: string,
  actionPath: number[]
): Partial<api.State> {
  const path = getPath(run, actionPath)

  const existingAction = get(state.runs, path)
  if (typeof existingAction !== "object") {
    console.log("WARN: try to collapse invalid action, path: ", actionPath)
    return state
  }

  const collapsed = !existingAction.collapsed
  const action = { ...existingAction, collapsed }
  const runs: api.Runs = set(state.runs, path, action)
  return { runs }
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
      nextState: event.state,
      stateCollapses: {}
    }

    runs[event.runId] = {
      id: event.runId,
      timestamp: event.timestamp,
      actions: [action],
      collapsed: false,
      interop: event.interop
    }

    return { runs, selectedAction: { run: event.runId, path: [0] } }
  },
  logAction: (event: api.ActionEvent) => state => {
    const runs = { ...state.runs }
    const run = runs[event.runId]
    const actions = [...run.actions]
    run.actions = actions
    const prevAction = actions.pop()
    if (prevAction.done) {
      // previous action done: create new action and append
      if (!event.callDone) {
        const action = {
          done: false,
          collapsed: false,
          actions: [],
          name: event.action,
          actionData: event.data,
          previousState: prevAction.nextState,
          stateCollapses: {}
        }

        actions.push(prevAction, action)
      } else {
        // error!, should we log it here?
        console.log("Previous action is done and event.callDone", state, event)
      }
    } else {
      // previous action not done: find parent action, create and append
      const action = appendActionEvent(prevAction, event)
      actions.push(action)
    }

    const selectedAction = {
      run: event.runId,
      path: [actions.length - 1]
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
    return toggleAction(state, run, path)
  },
  select: (selectedAction: api.SelectedAction | null) => state => {
    return { selectedAction }
  },
  timeTravel: (selectedAction: api.SelectedAction) => state => {
    const run = state.runs[selectedAction.run]
    const actionId = selectedAction.path[0]
    const { nextState } = run.actions[actionId]
    run.interop[api.injectedSetState](nextState)

    return {}
  },
  collapseAppAction: (payload: api.CollapseAppActionPayload) => state => {
    const { run, actionPath, appActionPath, collapsed } = payload

    const path = getPath(run, actionPath)
    path.push("stateCollapses", appActionPath)

    const runs: api.Runs = set(state.runs, path, collapsed)
    return { runs }
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
