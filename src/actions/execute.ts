import * as api from "../api"
import { get } from "../immutable"
import { getRun } from "../selectors"
import { getRegistered } from "../debuggedFunctions"

function executeAction(payload: api.ExecutePayload, state: api.State) {
  const { runId, name, args } = payload

  const run = getRun(state, runId)
  const action = get(run.interop, name.split("."))

  if (!action) throw new Error(`No action found with name "${name}".`)

  action(args[0])
}

function executeFunction(payload: api.ExecutePayload, state: api.State) {
  const { name, args } = payload

  const fn = getRegistered(name)
  fn(...args)
}

export const execute = (payload: api.ExecutePayload) => (state: api.State) => {
  const { type } = payload

  if (type === "action") {
    executeAction(payload, state)
  } else {
    executeFunction(payload, state)
  }
}
