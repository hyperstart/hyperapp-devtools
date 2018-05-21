import { h } from "hyperapp"

import "./Icon.scss"

// manually imported from open-iconic

interface SvgProps {
  d: string
  transform: string
  class?: string
}

const Svg = (d: string, transform: string) => (props: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="8"
      height="8"
      viewBox="0 0 8 8"
      class={props.class || ""}
      onclick={props.onclick}
    >
      <path d={d} transform={transform} />
    </svg>
  )
}

export type IconName = "caret-right" | "caret-bottom" | "cross" | "empty"

export interface IconProps {
  name: IconName
  class?: string
  onclick?: any
}

const CaretRight = Svg("M0 0v8l4-4-4-4z", "translate(2)")
const CaretBottom = Svg("M0 0l4 4 4-4h-8z", "translate(0 2)")
const Cross = Svg(
  "M1.41 0l-1.41 1.41.72.72 1.78 1.81-1.78 1.78-.72.69 1.41 1.44.72-.72 1.81-1.81 1.78 1.81.69.72 1.44-1.44-.72-.69-1.81-1.78 1.81-1.81.72-.72-1.44-1.41-.69.72-1.78 1.78-1.81-1.78-.72-.72z",
  ""
)
const Empty = Svg("", "")

export function Icon(props: IconProps) {
  switch (props.name) {
    case "caret-bottom":
      return CaretBottom(props)
    case "caret-right":
      return CaretRight(props)
    case "cross":
      return Cross(props)
    case "empty":
      return Empty(props)
    default:
      throw new Error("Invalid icon " + props.name)
  }
}
