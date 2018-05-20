import { AppEvent, State, Run, SelectedEvent } from "./api";
export declare function isValueDisplayExpanded(state: State, path: string): boolean;
export declare function getRun(state: State, runId: string): Run | null;
export declare function isSelectedEvent(state: State, event: AppEvent): boolean;
export declare function getSelectedEvent(state: State, event?: SelectedEvent): AppEvent | null;
export declare function getLatestRun(state: State): Run | null;
export declare function canTravelToSelectedEvent(state: State): boolean;
