import { Actions, ActionEvent } from "./devtools"

export interface OnAction {
  (call: ActionEvent): void
}

export function enhanceActions(
  onAction: OnAction,
  runId: string,
  actions: any,
  prefix?: string
): any {
  var namespace = prefix ? prefix + "." : ""
  return Object.keys(actions || {}).reduce(function(otherActions, name) {
    var namedspacedName = namespace + name
    var action = actions[name]
    otherActions[name] =
      typeof action === "function"
        ? function(data) {
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
        : enhanceActions(onAction, runId, action, namedspacedName)
    return otherActions
  }, {})
}
export default enhanceActions
