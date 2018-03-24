// # State

export interface AppState {
  state: any
  actionData?: any
  actionResult?: any
  previousState?: any
}

export interface AppAction {
  name: string
  states: AppState[]
  collapsed: boolean
}

export interface Run {
  id: string
  timestamp: number
  actions: AppAction[]
  collapsed: boolean
}

export interface Runs {
  [id: string]: Run
}

export interface InitEvent {
  runId: string
  timestamp: number
  state: any
}

export type EventType = "call-start" | "call-done"

export interface ActionEvent {
  type: EventType
  runId: string
  action: string
  data: any
  result?: any
}
export interface RuntimeEvent {
  message: any
  level: "info" | "warn" | "error"
}

export interface State {
  runs: Runs
  logs: RuntimeEvent[]
  paneShown: boolean
  selectedState: AppState | null
  collapseRepeatingActions: boolean
  showFullState: boolean
}

// # Actions

export interface ToggleActionPayload {
  run: string
  actionId: number
}

export interface Actions {
  log(event: RuntimeEvent)
  logInit(event: InitEvent)
  logAction(event: ActionEvent)
  select(state: AppState | null)
  showPane(shown: boolean)
  toggleRun(run: string)
  toggleAction(payload: ToggleActionPayload)
  toggleCollapseRepeatingActions()
  toggleShowFullState()
  deleteRun(id: string)
}
