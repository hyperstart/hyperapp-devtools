import { ActionsType } from "hyperapp"
import { get, merge, set } from "../immutable"

import * as api from "./api"

function getLatestState(action: api.AppAction): api.AppState {
  return action.states[action.states.length - 1]
}

function mergeResult(state: any, event: api.ActionEvent): any {
  if (event && event.result) {
    const action = event.action.split(".")
    action.pop()
    return merge(state, action, event.result)
  }
  return state
}

function createAction(
  state: api.AppState,
  collapsed: boolean,
  existing: Partial<api.AppAction> = {}
): api.AppAction {
  return {
    name: existing.name || "Initial State",
    states: (existing.states || []).concat([state]),
    collapsed
  }
}

export const actions: ActionsType<api.State, api.Actions> = {
  log: (event: api.RuntimeEvent) => state => {
    return { logs: state.logs.concat([event]) }
  },
  logInit: (event: api.InitEvent) => state => {
    const runs = { ...state.runs }
    const appState = { state: event.state }
    runs[event.runId] = {
      id: event.runId,
      timestamp: event.timestamp,
      actions: [createAction(appState, state.collapseRepeatingActions)],
      collapsed: false
    }

    return { runs, selectedState: appState }
  },
  logAction: (event: api.ActionEvent) => state => {
    const runs = { ...state.runs }
    const run = runs[event.runId]
    const actions = [...run.actions]
    const prevAction = actions.pop()
    const prevState = getLatestState(prevAction)
    let appState: api.AppState
    if (prevAction.name === event.action) {
      // append to previous action
      appState = {
        state: mergeResult(prevState.state, event),
        actionData: event.data,
        actionResult: event.result,
        previousState: prevState.state
      }
      const action = createAction(
        appState,
        state.collapseRepeatingActions,
        prevAction
      )

      runs[event.runId] = {
        id: event.runId,
        timestamp: runs[event.runId].timestamp,
        collapsed: run.collapsed,
        actions: [...actions, action]
      }
    } else {
      // create new action
      appState = {
        state: mergeResult(prevState.state, event),
        actionData: event.data,
        actionResult: event.result,
        previousState: prevState.state
      }
      const action = createAction(appState, state.collapseRepeatingActions, {
        name: event.action
      })

      runs[event.runId] = {
        id: event.runId,
        timestamp: runs[event.runId].timestamp,
        collapsed: run.collapsed,
        actions: [...actions, prevAction, action]
      }
    }
    return { runs, selectedState: appState }
  },
  toggleRun: (id: string) => state => {
    const runs = { ...state.runs }
    runs[id] = { ...runs[id], collapsed: !runs[id].collapsed }
    return { runs }
  },
  toggleAction: (payload: api.ToggleActionPayload) => state => {
    const { run, actionId } = payload
    const path = [run, "actions", actionId, "collapsed"]
    const collapsed = get(state.runs, path)
    const runs = set(state.runs, path, !collapsed)
    return { runs }
  },
  select: (selectedState: api.AppState | null) => {
    return { selectedState }
  },
  showPane: (paneShown: boolean) => {
    return { paneShown }
  },
  toggleCollapseRepeatingActions: () => state => {
    return { collapseRepeatingActions: !state.collapseRepeatingActions }
  },
  toggleShowFullState: () => state => {
    return { showFullState: !state.showFullState }
  },
  deleteRun: (id: string) => state => {
    const runs = { ...state.runs }
    delete runs[id]
    return { runs }
  }
}
