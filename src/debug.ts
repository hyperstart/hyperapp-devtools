import { getDevtoolsApp } from "./devtools"

export function debug<T = any>(value: T): T {
  if (typeof value === "function") {
    return <any>function() {
      // const actions = getDevtoolsApp()
      // if (actions) {
      //   actions.logFunctionEvent("Yay!")
      // }

      const result = (<any>value)(arguments)

      // if (actions) {
      //   actions.logFunctionEvent("Done!")
      // }

      return result
    }
  }
  return value
}
