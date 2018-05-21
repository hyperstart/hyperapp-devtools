export interface StringMap<V> {
  [key: string]: V
}

export type EventType = "function" | "action" | "init" | "message"

export type AppEvent = InitEvent | ActionEvent | FunctionEvent | MessageEvent

export interface BaseEvent {
  id: string
  type: EventType
  name: string
  children?: string[]
  collapsed?: boolean
  parent?: string
}

export interface InitEvent extends BaseEvent {
  type: "init"
  state: any
}

export interface ActionEvent extends BaseEvent {
  type: "action"
  data: any
  result?: any
  error?: any
  stateBefore: any
  stateAfter?: any
}

export interface FunctionEvent extends BaseEvent {
  type: "function"
  args: any[]
  result?: any
  error?: any
  returnedBy?: string
}

export type LogLevel = "info" | "warn" | "error"

export interface MessageEvent extends BaseEvent {
  type: "message"
  level: LogLevel
  message: any
}

export interface Run {
  id: string
  events: string[]
  eventsById: StringMap<AppEvent>
  timestamp: number
  collapsed: boolean
  currentEvent?: string
  currentState?: any
  interop: any
}

export interface SelectedEvent {
  runId: string
  eventId: string
}

export type PaneDisplay = "fullscreen" | "right" | "bottom"

export type ValueDisplay =
  | "state"
  | "result"
  | "args"
  | "message"
  | "data"
  | "debugger-state"

export interface State {
  runs: string[]
  runsById: StringMap<Run>
  selectedEvent: SelectedEvent | null
  collapseRepeatingEvents: boolean
  valueDisplay: ValueDisplay
  detailsPaneExpandedPaths: StringMap<boolean>
  paneDisplay: PaneDisplay
  paneShown: boolean
}

// # Actions

export interface LogInitPayload {
  runId: string
  timestamp: number
  state: any
  interop: any
}

export interface LogMessagePayload {
  runId: string
  eventId: string
  level: LogLevel
  message: any
}

export interface LogCallStartPayload {
  // use latest if not set.
  runId?: string
  eventId: string
  type: "function" | "action"
  name: string
  args: any[]
}

export interface LogCallEndPayload {
  runId?: string
  eventId: string
  result?: any
  error?: any
}

export interface ToggleEventPayload {
  runId: string
  eventId: string
}

export interface SetDetailsPaneExpandedPayload {
  path: string
  expanded: boolean
}

export interface ExecutePayload {
  type: "function" | "action"
  runId: string
  name: string
  args: any[]
}

export interface Actions {
  logInit(payload: LogInitPayload)
  logMessage(payload: LogMessagePayload)
  logCallStart(payload: LogCallStartPayload)
  logCallEnd(payload: LogCallEndPayload)
  toggleRun(run: string)
  toggleEvent(payload: ToggleEventPayload)
  toggleCollapseRepeatingEvents()
  setDetailsPaneExpanded(payload: SetDetailsPaneExpandedPayload)
  showPane(shown: boolean)
  setPaneDisplay(paneDisplay: PaneDisplay)
  setValueDisplay(valueDisplay: ValueDisplay)
  select(action: SelectedEvent | null)
  timeTravel(action: SelectedEvent)
  execute(payload: ExecutePayload)
  deleteRun(id: string)
}

export const injectedSetState = "$__SET_STATE"
