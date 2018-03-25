// # State

export interface AppAction {
  name: string
  done: boolean
  nestedActions: AppAction[]
  previousState: any | null
  collapsed: boolean
  nextState?: any
  actionData?: any
  actionResult?: any
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

export interface ActionEvent {
  callDone: boolean
  runId: string
  action: string
  data: any
  result?: any
}
export interface RuntimeEvent {
  message: any
  level: "info" | "warn" | "error"
}

export type PaneDisplay = "fullscreen" | "right" | "bottom"

export type ValueDisplay = "state" | "result" | "data"

export interface State {
  runs: Runs
  logs: RuntimeEvent[]
  paneShown: boolean
  paneDisplay: PaneDisplay
  selectedAction: AppAction | null
  collapseRepeatingActions: boolean
  valueDisplay: ValueDisplay
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
  select(state: AppAction | null)
  showPane(shown: boolean)
  setPaneDisplay(paneDisplay: PaneDisplay)
  setValueDisplay(valueDisplay: ValueDisplay)
  toggleRun(run: string)
  toggleAction(payload: ToggleActionPayload)
  toggleCollapseRepeatingActions()
  deleteRun(id: string)
}
