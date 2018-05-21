import { AppEvent, State, Run, SelectedEvent } from "./api";
export declare function isValueDisplayExpanded(state: State, path: string): boolean;
export declare function getLatestRunId(state: State): string;
export declare function getRun(state: State, runId: string): Run;
export declare function isSelectedEvent(state: State, event: AppEvent): boolean;
export declare function getSelectedEvent(state: State, event?: SelectedEvent): AppEvent | null;
export declare function getLatestRun(state: State): Run;
export declare function canTravelToSelectedEvent(state: State): boolean;
