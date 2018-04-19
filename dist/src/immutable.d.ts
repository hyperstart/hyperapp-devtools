/**
 * Path: Array<string | number>
 */
export declare type Path = Array<string | number>;
/**
 * Get the value at the given path in the given target, or undefined if path doesn't exists.
 */
export declare function get<T = any, R = any>(target: T, path: Path): R;
/**
 * Immutable set: set the value at the given path in the given target and returns a new target.
 * Creates the necessary objects/arrays if the path doesn't exist.
 */
export declare function set<T = any, V = any, R = any>(target: T, path: Path, value: V): R;
/**
 * Immutable merge: merges the given value and the existing value (if any) at the path in the target using Object.assign() and return a new target.
 * Creates the necessary objects/arrays if the path doesn't exist.
 */
export declare function merge<T = any, V = any, R = any>(target: T, path: Path, value: V): R;
