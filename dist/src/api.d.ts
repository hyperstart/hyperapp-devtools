export interface AppAction {
    name: string;
    done: boolean;
    actions: AppAction[];
    previousState: any | null;
    collapsed: boolean;
    nextState?: any;
    actionData?: any;
    actionResult?: any;
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
export interface InitEvent {
    runId: string;
    timestamp: number;
    state: any;
}
export interface ActionEvent {
    callDone: boolean;
    runId: string;
    action: string;
    data: any;
    result?: any;
}
export interface RuntimeEvent {
    message: any;
    level: "info" | "warn" | "error";
}
export declare type PaneDisplay = "fullscreen" | "right" | "bottom";
export declare type ValueDisplay = "state" | "result" | "data" | "debugger-state";
export interface State {
    runs: Runs;
    logs: RuntimeEvent[];
    paneShown: boolean;
    paneDisplay: PaneDisplay;
    selectedAction: AppAction | null;
    collapseRepeatingActions: boolean;
    valueDisplay: ValueDisplay;
}
export interface ToggleActionPayload {
    run: string;
    path: number[];
}
export interface Actions {
    log(event: RuntimeEvent): any;
    logInit(event: InitEvent): any;
    logAction(event: ActionEvent): any;
    select(action: AppAction | null): any;
    showPane(shown: boolean): any;
    setPaneDisplay(paneDisplay: PaneDisplay): any;
    setValueDisplay(valueDisplay: ValueDisplay): any;
    toggleRun(run: string): any;
    toggleAction(payload: ToggleActionPayload): any;
    toggleCollapseRepeatingActions(): any;
    deleteRun(id: string): any;
}
