import { h } from "hyperapp"

import { State, Actions, ActionEvent, FunctionEvent } from "../api"
import {
  isValueDisplayExpanded,
  getCallText,
  getArgsFromCallText
} from "../selectors"
import { ObjectView } from "./ObjectView"

import "./CallOverviewDetailsPane.scss"
import { getErrorMessage } from "../utils"

interface CallProps extends CallOverviewDetailsPaneProps {
  args?: any[]
  error?: string
}

// # getCallProps

function getCallProps(props: CallOverviewDetailsPaneProps): CallProps {
  const { state, actions, event } = props
  try {
    const args = getArgsFromCallText(event, state.callOverviewText)
    return { state, actions, event, args }
  } catch (e) {
    const error = getErrorMessage(e)
    return { state, actions, event, error }
  }
}

// # CallTextArea

function CallTextArea(props: CallProps) {
  const { state, actions, event } = props
  return (
    <textarea
      class="call-text-area"
      value={state.callOverviewText}
      oninput={(e: Event) => {
        actions.setCallOverviewText(e.target["value"])
      }}
    />
  )
}

// # CallTextAction

function CallTextAction(props: CallProps) {
  const { state, actions, event, args, error } = props
  return (
    <div class="call-text-action">
      {error ? <div class="call-text-error">{error}</div> : <div />}
      <button
        onclick={() => {
          actions.execute({
            type: event.type,
            name: event.name,
            runId: state.selectedEvent.runId,
            args
          })
        }}
        disabled={!!error}
      >
        Execute
      </button>
    </div>
  )
}

// # ResultPane

function ResultPane(props: CallProps) {
  const { state, actions, event } = props

  function expanded(path: string, expanded?: boolean) {
    const result = isValueDisplayExpanded(state, path)
    if (typeof expanded === "boolean") {
      actions.setDetailsPaneExpanded({
        expanded: !result,
        path
      })
    }

    return result
  }

  return (
    <div class="result-pane scrollable">
      {ObjectView({ value: event.result, expanded })}
    </div>
  )
}

// # CallOverviewDetailsPane

export interface CallOverviewDetailsPaneProps {
  state: State
  actions: Actions
  event: ActionEvent | FunctionEvent
}

export function CallOverviewDetailsPane(props: CallOverviewDetailsPaneProps) {
  const { state, actions, event } = props

  const callProps = getCallProps(props)
  return (
    <div class="object-details-pane scrollable">
      <div class="scrollable-content call-overview-details-pane">
        <section class="call-section">
          <h3>Call</h3>
          {CallTextArea(callProps)}
          {CallTextAction(callProps)}
        </section>
        <section class="response-section">
          <h3>Response</h3>
          {ResultPane(callProps)}
        </section>
      </div>
    </div>
  )
}
