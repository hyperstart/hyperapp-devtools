export interface AppState {
    state: any;
    actionData?: any;
    actionResult?: any;
    previousState?: any;
}
export interface AppAction {
    name: string;
    states: AppState[];
    collapsed: boolean;
}
export interface Run {
    id: string;
    timestamp: number;
    actions: AppAction[];
    collapsed: boolean;
}
export interface Runs {
    [id: string]: Run;
}
export declare type AppEvent = InitEvent | ActionEvent | RuntimeEvent;
export interface InitEvent {
    type: "INITIALIZE";
    id: string;
    timestamp: number;
    state: any;
}
export interface ActionEvent {
    type: "ACTION";
    id: string;
    action: string;
    data: any;
    result: any;
}
export interface RuntimeEvent {
    type: "RUNTIME";
    message: any;
    level: "info" | "warn" | "error";
}
export interface State {
    runs: Runs;
    logs: RuntimeEvent[];
    paneShown: boolean;
    selectedState: AppState | null;
    collapseRepeatingActions: boolean;
    showFullState: boolean;
}
export interface ToggleActionPayload {
    run: string;
    actionId: number;
}
export interface Actions {
    log(event: AppEvent): any;
    select(state: AppState | null): any;
    showPane(shown: boolean): any;
    toggleRun(run: string): any;
    toggleAction(payload: ToggleActionPayload): any;
    toggleCollapseRepeatingActions(): any;
    toggleShowFullState(): any;
    deleteRun(id: string): any;
}
