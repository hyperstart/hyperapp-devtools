/**
 * Path: Array<string | number>
 */
export type Path = Array<string | number> | string

/**
 * Get the value at the given path in the given target, or undefined if path doesn't exists.
 */
export function get<T = any, R = any>(target: T, path: Path): R {
  path = typeof path === "string" ? path.split(".") : path
  let result: any = target
  for (var i = 0; i < path.length; i++) {
    result = result ? result[path[i]] : result
  }
  return result as R
}

/**
 * Immutable set: set the value at the given path in the given target and returns a new target.
 * Creates the necessary objects/arrays if the path doesn't exist.
 */
export function set<T = any, V = any, R = any>(
  target: T,
  path: Path,
  value: V
): R {
  path = typeof path === "string" ? path.split(".") : path
  if (path.length === 0) {
    return (value as any) as R
  }
  return assign(Array.isArray(target) ? [] : {}, target, {
    [path[0]]:
      path.length > 1 ? set(target[path[0]] || {}, path.slice(1), value) : value
  })
}

/**
 * Immutable merge: merges the given value and the existing value (if any) at the path in the target using Object.assign() and return a new target.
 * Creates the necessary objects/arrays if the path doesn't exist.
 */
export function merge<T = any, V = any, R = any>(
  target: T,
  path: Path,
  value: V
): R {
  return set(
    target,
    path,
    assign(Array.isArray(value) ? [] : {}, get(target, path), value)
  )
}

function assign(target: any, obj: any, obj2: any): any {
  for (let i in obj) {
    target[i] = obj[i]
  }
  for (let i in obj2) {
    target[i] = obj2[i]
  }
  return target
}
