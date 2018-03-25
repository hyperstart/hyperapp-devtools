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

export interface State {
  runs: Runs
  logs: RuntimeEvent[]
  paneShown: boolean
  selectedAction: AppAction | null
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
  select(state: AppAction | null)
  showPane(shown: boolean)
  toggleRun(run: string)
  toggleAction(payload: ToggleActionPayload)
  toggleCollapseRepeatingActions()
  toggleShowFullState()
  deleteRun(id: string)
}
