import { State, Run, AppAction } from "./api";
import { Path } from "./immutable";
export declare function getRuns(state: State): Run[];
export declare function getSelectedAction(state: State): AppAction | null;
export declare function getPath(run: string, path: number[]): Path;
export declare function isSelectedAction(state: State, run: string, path: number[]): boolean;
