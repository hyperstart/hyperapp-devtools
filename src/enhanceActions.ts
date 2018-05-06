import { Actions, ActionEvent } from "./api"

export interface OnAction {
  (call: ActionEvent): void
}

export function enhanceActions(
  onAction: OnAction,
  runId: string,
  actions: any,
  prefix?: string
): any {
  const result = {}

  const namespace = prefix ? prefix + "." : ""
  Object.keys(actions || {}).forEach(name => {
    var action = actions[name]
    if (!action) {
      result[name] = null
      return
    }

    const fnName = action.name || name
    const namedspacedName = namespace + fnName
    if (typeof action === "function") {
      result[name] = function(data) {
        return function(state, actions) {
          onAction({
            callDone: false,
            action: namedspacedName,
            data,
            runId
          })
          var result = action(data)
          result =
            typeof result === "function" ? result(state, actions) : result
          onAction({
            callDone: true,
            action: namedspacedName,
            data,
            result,
            runId
          })
          return result
        }
      }
    } else {
      result[name] = enhanceActions(onAction, runId, action, namedspacedName)
    }
  })

  return result
}

export default enhanceActions
