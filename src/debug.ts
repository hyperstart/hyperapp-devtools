import { StringMap } from "./api"
import { getDevtoolsApp } from "./devtools"
import { guid } from "./utils"
import { registerDebuggedFunction } from "./debuggedFunctions"

function debugWithoutRegistering<T extends Function = any>(
  val: T,
  name: string = "(anonymous function)"
): T {
  return <any>function(...args) {
    const actions = getDevtoolsApp()
    const eventId = guid()
    if (actions) {
      actions.logCallStart({
        type: "function",
        eventId,
        name,
        args
      })
    }

    try {
      const result = (<any>val)(...args)

      if (actions) {
        actions.logCallEnd({
          eventId,
          result
        })
      }

      if (typeof result === "function") {
        return debugWithoutRegistering(result)
      }

      return result
    } catch (error) {
      if (actions) {
        actions.logCallEnd({
          eventId,
          error
        })
      }

      throw error
    }
  }
}

export function debug<T extends Function = any>(
  nameOrValue: T | string,
  value?: T
): T {
  const val = typeof nameOrValue === "string" ? value : nameOrValue
  const name = typeof nameOrValue === "string" ? nameOrValue : nameOrValue.name
  if (!name) {
    throw new Error(
      `Please provide a unique name: debug("myFn", () => { ... } or use a named function.`
    )
  }

  if (typeof val !== "function") {
    throw new Error(`Can only debug a function but got ${typeof val}.`)
  }

  const result = debugWithoutRegistering(val, name)
  registerDebuggedFunction(name, result)
  return result
}
