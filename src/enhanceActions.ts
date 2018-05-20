import { Actions } from "./api"
import { guid } from "./utils"

export function enhanceActions(
  hoaActions: Actions,
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
          const eventId = guid()
          hoaActions.logCallStart({
            type: "action",
            name: namedspacedName,
            args: [data],
            eventId,
            runId
          })
          try {
            let result = action(data)
            result =
              typeof result === "function" ? result(state, actions) : result

            hoaActions.logCallEnd({
              runId,
              eventId,
              result
            })

            return result
          } catch (error) {
            hoaActions.logCallEnd({
              runId,
              eventId,
              error
            })

            throw error
          }
        }
      }
    } else {
      result[name] = enhanceActions(hoaActions, runId, action, namedspacedName)
    }
  })

  return result
}

export default enhanceActions
