export interface StringMap<V> {
    [key: string]: V;
}
export declare type EventType = "function" | "action" | "init" | "message";
export declare type AppEvent = InitEvent | ActionEvent | FunctionEvent | MessageEvent;
export interface BaseEvent {
    id: string;
    type: EventType;
    name: string;
    children?: string[];
    collapsed?: boolean;
    parent?: string;
}
export interface InitEvent extends BaseEvent {
    type: "init";
    state: any;
}
export interface ActionEvent extends BaseEvent {
    type: "action";
    data: any;
    result?: any;
    error?: any;
    stateBefore: any;
    stateAfter?: any;
}
export interface FunctionEvent extends BaseEvent {
    type: "function";
    args: any[];
    result?: any;
    error?: any;
    returnedBy?: string;
}
export declare type LogLevel = "info" | "warn" | "error";
export interface MessageEvent extends BaseEvent {
    type: "message";
    level: LogLevel;
    message: any;
}
export interface Run {
    id: string;
    events: string[];
    eventsById: StringMap<AppEvent>;
    timestamp: number;
    collapsed: boolean;
    currentEvent?: string;
    currentState?: any;
    interop: any;
}
export interface SelectedEvent {
    runId: string;
    eventId: string;
}
export declare type PaneDisplay = "fullscreen" | "right" | "bottom";
export declare type ValueDisplay = "state" | "result" | "args" | "message" | "data" | "debugger-state";
export interface State {
    runs: string[];
    runsById: StringMap<Run>;
    selectedEvent: SelectedEvent | null;
    collapseRepeatingEvents: boolean;
    valueDisplay: ValueDisplay;
    detailsPaneExpandedPaths: StringMap<boolean>;
    paneDisplay: PaneDisplay;
    paneShown: boolean;
}
export interface LogInitPayload {
    runId: string;
    timestamp: number;
    state: any;
    interop: any;
}
export interface LogMessagePayload {
    runId: string;
    eventId: string;
    level: LogLevel;
    message: any;
}
export interface LogCallStartPayload {
    runId?: string;
    eventId: string;
    type: "function" | "action";
    name: string;
    args: any[];
}
export interface LogCallEndPayload {
    runId?: string;
    eventId: string;
    result?: any;
    error?: any;
}
export interface ToggleEventPayload {
    runId: string;
    eventId: string;
}
export interface SetDetailsPaneExpandedPayload {
    path: string;
    expanded: boolean;
}
export interface ExecutePayload {
    type: "function" | "action";
    runId: string;
    name: string;
    args: any[];
}
export interface Actions {
    logInit(payload: LogInitPayload): any;
    logMessage(payload: LogMessagePayload): any;
    logCallStart(payload: LogCallStartPayload): any;
    logCallEnd(payload: LogCallEndPayload): any;
    toggleRun(run: string): any;
    toggleEvent(payload: ToggleEventPayload): any;
    toggleCollapseRepeatingEvents(): any;
    setDetailsPaneExpanded(payload: SetDetailsPaneExpandedPayload): any;
    showPane(shown: boolean): any;
    setPaneDisplay(paneDisplay: PaneDisplay): any;
    setValueDisplay(valueDisplay: ValueDisplay): any;
    select(action: SelectedEvent | null): any;
    timeTravel(action: SelectedEvent): any;
    execute(payload: ExecutePayload): any;
    deleteRun(id: string): any;
}
export declare const injectedSetState = "$__SET_STATE";
