// this file is taken from https://raw.githubusercontent.com/Mytrill/hyperapp-object-view
// TODO: replace by the real hyperapp-object-view once Whaaley merge the PR :)

import "./ObjectView.scss"

function h(nodeName, attributes, children) {
  return {
    nodeName: nodeName,
    attributes: attributes,
    children: Array.isArray(children) ? children : [children]
  }
}

function Wrap(data, children) {
  var key = data.key
  return h("div", { class: "-row" }, [
    key && h("span", { class: "-key" }, key),
    children
  ])
}

function Pair(data, classList) {
  return Wrap(data, h("span", { class: classList }, data.value + ""))
}

function Switch(data, path, expanded) {
  var value = data.value
  switch (typeof value) {
    case "boolean":
      return Pair(data, "-boolean")
    case "function":
      return Wrap(data, h("span", { class: "-function" }))
    case "number":
      return Pair(data, "-number")
    case "object":
      return Wrap(
        data,
        value
          ? Array.isArray(value)
            ? Arr(value, path, expanded)
            : Obj(value, path, expanded)
          : h("span", { class: "-null" })
      )
    case "string":
      return Pair(data, "-string")
    case "undefined":
      return Wrap(data, h("span", { class: "-undefined" }))
  }
  return Pair(data)
}

function Expand(path, expanded) {
  return (
    expanded &&
    h("span", {
      class: "-expand",
      onclick: function() {
        expanded(path, true)
      }
    })
  )
}

function Collapse(path, expanded) {
  return (
    expanded &&
    h("span", {
      class: "-collapse",
      onclick: function() {
        expanded(path, false)
      }
    })
  )
}

function Arr(value, path, expanded) {
  if (expanded && !expanded(path)) {
    return h("span", { class: "-array" }, Expand(path, expanded))
  }
  var result = [Collapse(path, expanded)]
  for (var i = 0; i < value.length; i++) {
    result.push(Switch({ value: value[i] }, path + "." + i, expanded))
  }
  return h("span", { class: "-array" }, result)
}

function Obj(value, path, expanded) {
  if (expanded && !expanded(path)) {
    return h("span", { class: "-object" }, Expand(path, expanded))
  }
  var keys = Object.keys(value)
  var result = [Collapse(path, expanded)]
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    result.push(
      Switch({ key: key, value: value[key] }, path + "." + key, expanded)
    )
  }
  return h("span", { class: "-object" }, result)
}

export function ObjectView(props) {
  props.path = props.path || "root"
  return h(
    "div",
    { class: "_object-view" },
    Switch(props, props.path, props.expanded)
  )
}
