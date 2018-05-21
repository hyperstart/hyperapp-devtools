import { StringMap } from "./api"

const FUNCTIONS: StringMap<any> = {}

export function registerDebuggedFunction(name: string, fn: any) {
  if (FUNCTIONS[name]) {
    throw new Error(
      `There is already a function registered with name "${name}".`
    )
  }

  FUNCTIONS[name] = fn
}

export function isRegistered(name: string): boolean {
  return !!FUNCTIONS[name]
}

export function getRegistered(name: string): any {
  const result = FUNCTIONS[name]
  if (!result) throw new Error(`No function registered with name ${name}.`)
  return result
}
