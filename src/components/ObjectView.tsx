import { h } from "hyperapp"

import "./ObjectView.scss"

interface InternalViewProps extends ObjectViewProps {
  path: string
}

function Delimiter({ val }) {
  return <span class="delimiter">{val}</span>
}

function Obj(props: InternalViewProps) {
  const { value, path, expanded } = props
  const keys = Object.keys(value)
  const collapsed = !expanded(path)
  const onclick = (e: Event) => {
    e.stopPropagation()
    expanded(path, collapsed)
  }

  const name = value && value.constructor && value.constructor.name

  if (keys.length === 0 || collapsed) {
    return (
      <span class="object" onclick={onclick}>
        {name && name !== "Object" && <span class="name">{name}</span>}
        <Delimiter val="{" />
        {collapsed && "..."}
        <Delimiter val="}" />
      </span>
    )
  }

  const length = keys.length
  return (
    <span class="object" onclick={onclick}>
      <Delimiter val="{" />
      {keys.map((key, i) => {
        return (
          <div class="row">
            <span class="key">{key}</span>
            <Delimiter val=": " />
            {Value({ value: value[key], path: path + "." + key, expanded })}
            {i < length - 1 && <Delimiter val=", " />}
          </div>
        )
      })}
      <Delimiter val="}" />
    </span>
  )
}

interface ArrProps extends InternalViewProps {
  value: any[]
}

function Arr(props: ArrProps) {
  const { value, path, expanded } = props
  const collapsed = !expanded(path)
  const onclick = (e: Event) => {
    e.stopPropagation()
    expanded(path, collapsed)
  }

  if (value.length === 0 || collapsed) {
    return (
      <span class="array" onclick={onclick}>
        <Delimiter val="[" />
        {collapsed && "..."}
        <Delimiter val="]" />
      </span>
    )
  }

  const length = value.length
  return (
    <span class="array" onclick={onclick}>
      <Delimiter val="[" />
      {value.map((val, i) => {
        return (
          <div class="row">
            {Value({ value: val, path: path + "." + i, expanded })}
            {i < length - 1 && <Delimiter val="," />}
          </div>
        )
      })}
      <Delimiter val="]" />
    </span>
  )
}

function Value(props: InternalViewProps) {
  const type = typeof props.value
  switch (type) {
    case "boolean":
      return <span class="boolean">{String(props.value)}</span>
    case "function":
      return <span class="function">f()</span>
    case "number":
      return <span class="number">{props.value}</span>
    case "object":
      if (!props.value) {
        return <span class="null">null</span>
      }
      if (Array.isArray(props.value)) {
        return Arr(props)
      }
      return Obj(props)
    case "string":
      return <span class="string">"{props.value}"</span>
    case "symbol":
      return <span class="symbol">"{props.value.toString()}"</span>
    case "undefined":
      return <span class="undefined">undefined</span>
  }
}

export interface ObjectViewProps {
  value: any
  expanded(path: string, expanded?: boolean): boolean
}

export function ObjectView(props: ObjectViewProps) {
  const { value, expanded } = props
  const path = "root"
  return <div class="object-view">{Value({ value, path, expanded })}</div>
}
