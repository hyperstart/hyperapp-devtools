export interface StringMap<Value = any> {
    [key: string]: Value;
}
export interface AppAction {
    name: string;
    done: boolean;
    actions: AppAction[];
    previousState: any | null;
    collapsed: boolean;
    nextState?: any;
    actionData?: any;
    actionResult?: any;
    stateCollapses: StringMap<boolean>;
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
export interface SelectedAction {
    run: string;
    path: number[];
}
export interface State {
    runs: Runs;
    logs: RuntimeEvent[];
    paneShown: boolean;
    paneDisplay: PaneDisplay;
    selectedAction: SelectedAction | null;
    collapseRepeatingActions: boolean;
    valueDisplay: ValueDisplay;
}
export interface ToggleActionPayload {
    run: string;
    path: number[];
}
export interface CollapseAppActionPayload {
    run: string;
    actionPath: number[];
    appActionPath: string;
    collapsed: boolean;
}
export interface Actions {
    log(event: RuntimeEvent): any;
    logInit(event: InitEvent): any;
    logAction(event: ActionEvent): any;
    collapseAppAction(payload: CollapseAppActionPayload): any;
    select(action: SelectedAction | null): any;
    showPane(shown: boolean): any;
    setPaneDisplay(paneDisplay: PaneDisplay): any;
    setValueDisplay(valueDisplay: ValueDisplay): any;
    toggleRun(run: string): any;
    toggleAction(payload: ToggleActionPayload): any;
    toggleCollapseRepeatingActions(): any;
    deleteRun(id: string): any;
}
