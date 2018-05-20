(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.devtools = {})));
}(this, (function (exports) { 'use strict';

function debug(value) {
    if (typeof value === "function") {
        return function () {
            // const actions = getDevtoolsApp()
            // if (actions) {
            //   actions.logFunctionEvent("Yay!")
            // }
            var result = value(arguments);
            // if (actions) {
            //   actions.logFunctionEvent("Done!")
            // }
            return result;
        };
    }
    return value;
}

var ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
var SIZE = 16;
var rand = function () { return ALPHABET[Math.floor(Math.random() * ALPHABET.length)]; };
var guid = function () {
    return Array.apply(null, Array(SIZE))
        .map(rand)
        .join("");
};
function truncate(value, maxLength) {
    if (maxLength === void 0) { maxLength = 30; }
    if (value.length <= maxLength) {
        return value;
    }
    return value.substr(0, maxLength - 2) + "...";
}

function h(name, attributes) {
  var rest = [];
  var children = [];
  var length = arguments.length;

  while (length-- > 2) rest.push(arguments[length]);

  while (rest.length) {
    var node = rest.pop();
    if (node && node.pop) {
      for (length = node.length; length--; ) {
        rest.push(node[length]);
      }
    } else if (node != null && node !== true && node !== false) {
      children.push(node);
    }
  }

  return typeof name === "function"
    ? name(attributes || {}, children)
    : {
        nodeName: name,
        attributes: attributes || {},
        children: children,
        key: attributes && attributes.key
      }
}

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css = ".hyperapp-devtools {\n  font-size: 1rem;\n  line-height: 1.25rem; }\n  .hyperapp-devtools button {\n    border: 1px solid #000000;\n    color: #000000;\n    background-color: #ffffff;\n    border-radius: 0.2rem;\n    margin: 0 0.1rem;\n    padding: 2px 7px;\n    font-size: 0.8rem; }\n    .hyperapp-devtools button.selected {\n      background: #9fbbdf; }\n      .hyperapp-devtools button.selected:hover {\n        background: #9fbbdf; }\n      .hyperapp-devtools button.selected:active {\n        background: #bcd7fc; }\n      .hyperapp-devtools button.selected:focus {\n        outline: 0; }\n    .hyperapp-devtools button:hover {\n      cursor: pointer;\n      background: #d3e5fd; }\n    .hyperapp-devtools button:active {\n      background: #bcd7fc; }\n    .hyperapp-devtools button:focus {\n      outline: 0; }\n    .hyperapp-devtools button[disabled] {\n      border-color: #666666;\n      color: #666666;\n      background-color: #dddddd; }\n      .hyperapp-devtools button[disabled]:hover {\n        cursor: not-allowed; }\n  .hyperapp-devtools .scrollable {\n    display: flex;\n    overflow: auto; }\n    .hyperapp-devtools .scrollable .scrollable-content {\n      display: flex;\n      min-height: 0px;\n      min-width: 0px;\n      flex-grow: 1; }\n\n.devtools-overlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  height: 100vh;\n  width: 100vw;\n  z-index: 10; }\n  .devtools-overlay.align-right {\n    width: 50vw;\n    left: 50vw; }\n  .devtools-overlay.align-bottom {\n    height: 50vh;\n    top: 50vh; }\n";
styleInject(css);

var css$2 = ".debugger-options {\n  display: flex;\n  flex-shrink: 0; }\n  .debugger-options .option {\n    flex-grow: 1;\n    padding-left: 0.5rem;\n    padding-right: 0.5rem; }\n";
styleInject(css$2);

function DebuggerOptions(props) {
    var state = props.state, actions = props.actions;
    return (h("div", { class: "debugger-options" },
        h("div", { class: "option" },
            h("input", { id: "debugger-group-actions-cb", type: "checkbox", checked: state.collapseRepeatingEvents, onchange: actions.toggleCollapseRepeatingEvents }),
            h("label", { for: "debugger-group-actions-cb" }, "Group repeating actions")),
        h("div", { class: "option" },
            h("select", { onchange: function (e) { return actions.setValueDisplay(e.target.value); }, value: state.valueDisplay },
                h("option", { value: "state" }, "Show Full State"),
                h("option", { value: "result" }, "Show Action Result"),
                h("option", { value: "data" }, "Show Action Data"),
                h("option", { value: "debugger-state" }, "Show Debugger Own State")))));
}

var css$4 = ".debug-pane-toolbar {\n  display: flex;\n  justify-content: space-between;\n  flex-shrink: 0;\n  width: 100%;\n  border-bottom: 1px solid #000000; }\n  .debug-pane-toolbar .toolbar-section {\n    align-items: center;\n    display: flex;\n    flex: 1 0 0; }\n    .debug-pane-toolbar .toolbar-section:not(:first-child):last-child {\n      justify-content: flex-end; }\n  .debug-pane-toolbar .view-buttons {\n    margin: 0.1rem; }\n  .debug-pane-toolbar .travel-button {\n    margin: 0.1rem;\n    align-items: center;\n    display: flex;\n    flex: 0 0 auto; }\n  .debug-pane-toolbar .close-button {\n    margin: 0.1rem 0.3rem; }\n";
styleInject(css$4);

function isValueDisplayExpanded(state, path) {
    var expanded = state.detailsPaneExpandedPaths[path];
    if (typeof expanded === "boolean") {
        return expanded;
    }
    return path.split(".").length < 4;
}
function getRun(state, runId) {
    return state.runsById[runId] || null;
}
function isSelectedEvent(state, event) {
    var selected = state.selectedEvent;
    if (!selected || !event) {
        return false;
    }
    var run = state.runsById[selected.runId];
    return run && run.eventsById[selected.eventId] === event;
}
function getSelectedEvent(state, event) {
    if (event === void 0) { event = state.selectedEvent; }
    if (!event) {
        return null;
    }
    return state.runsById[event.runId].eventsById[event.eventId];
}
function getLatestRun(state) {
    if (state.runs.length === 0) {
        return null;
    }
    return state.runsById[state.runs.length - 1];
}
function canTravelToSelectedEvent(state) {
    var run = getLatestRun(state);
    var event = getSelectedEvent(state);
    if (!run || !event || event.type !== "action") {
        return false;
    }
    return event.stateAfter && event.stateAfter !== run.currentState;
}

var Svg = function (d, transform) { return function (props) {
    return (h("svg", { xmlns: "http://www.w3.org/2000/svg", width: "8", height: "8", viewBox: "0 0 8 8", class: props.class || "", onclick: props.onclick },
        h("path", { d: d, transform: transform })));
}; };
var CaretRight = Svg("M0 0v8l4-4-4-4z", "translate(2)");
var CaretBottom = Svg("M0 0l4 4 4-4h-8z", "translate(0 2)");
var Cross = Svg("M1.41 0l-1.41 1.41.72.72 1.78 1.81-1.78 1.78-.72.69 1.41 1.44.72-.72 1.81-1.81 1.78 1.81.69.72 1.44-1.44-.72-.69-1.81-1.78 1.81-1.81.72-.72-1.44-1.41-.69.72-1.78 1.78-1.81-1.78-.72-.72z", "");
var Empty = Svg("", "");
function Icon(props) {
    switch (props.name) {
        case "caret-bottom":
            return CaretBottom(props);
        case "caret-right":
            return CaretRight(props);
        case "cross":
            return Cross(props);
        case "empty":
            return Empty(props);
        default:
            throw new Error("Invalid icon " + props.name);
    }
}

function DebugPaneToolbar(props) {
    var state = props.state, actions = props.actions;
    return (h("div", { class: "debug-pane-toolbar" },
        h("span", { class: "toolbar-section view-buttons" },
            h("button", { class: state.paneDisplay === "fullscreen" ? "selected" : "", onclick: function () { return actions.setPaneDisplay("fullscreen"); } }, "Full Screen"),
            h("button", { class: state.paneDisplay === "right" ? "selected" : "", onclick: function () { return actions.setPaneDisplay("right"); } }, "Right"),
            h("button", { class: state.paneDisplay === "bottom" ? "selected" : "", onclick: function () { return actions.setPaneDisplay("bottom"); } }, "Bottom")),
        h("span", { class: "toolbar-section travel-button" },
            h("button", { onclick: function () { return actions.timeTravel(state.selectedEvent); }, disabled: !canTravelToSelectedEvent(state) }, "Travel to Action")),
        h("span", { class: "toolbar-section close-button" },
            h(Icon, { name: "cross", onclick: function () { return actions.showPane(false); } }))));
}

var css$6 = ".debug-pane-content {\n  display: flex;\n  flex-direction: row;\n  flex-grow: 1;\n  min-width: 0;\n  min-height: 0; }\n";
styleInject(css$6);

var css$8 = ".object-details-pane {\n  flex: 0 0 60%;\n  border: 1px solid #000000;\n  margin: 0.1rem; }\n  .object-details-pane pre {\n    margin: 0rem; }\n";
styleInject(css$8);

var css$10 = "@charset \"UTF-8\";\n._object-view {\n  display: flex;\n  flex-grow: 1;\n  overflow: auto;\n  color: #c0c5ce;\n  white-space: nowrap;\n  background: #2b303b;\n  font-family: \"Roboto Mono\", monospace;\n  font-size: 0.8rem;\n  line-height: 1rem; }\n  ._object-view .-row {\n    padding: 0 0 0 2ch; }\n    ._object-view .-row:not(:last-of-type)::after {\n      content: \",\"; }\n  ._object-view .-key {\n    color: #bf616a; }\n    ._object-view .-key::after {\n      color: #c0c5ce;\n      content: \": \"; }\n  ._object-view .-null::before {\n    color: #d08770;\n    content: \"null\"; }\n  ._object-view .-array::after {\n    content: \"]\"; }\n  ._object-view .-array::before {\n    content: \"[\"; }\n  ._object-view .-boolean {\n    color: #96b5b4; }\n  ._object-view .-function::before {\n    content: \"ƒ\"; }\n  ._object-view .-number {\n    color: #ebcb8b; }\n  ._object-view .-object::after {\n    content: \"}\"; }\n  ._object-view .-object::before {\n    content: \"{\"; }\n  ._object-view .-string {\n    color: #a3be8c; }\n    ._object-view .-string::after {\n      content: \"'\"; }\n    ._object-view .-string::before {\n      content: \"'\"; }\n  ._object-view .-undefined::before {\n    color: #d08770;\n    content: \"undefined\"; }\n  ._object-view .-expand::before {\n    content: \"+\"; }\n  ._object-view .-collapse::before {\n    content: \"-\"; }\n";
styleInject(css$10);

// this file is taken from https://raw.githubusercontent.com/Mytrill/hyperapp-object-view
// TODO: replace by the real hyperapp-object-view once Whaaley merge the PR :)

function h$1(nodeName, attributes, children) {
  return {
    nodeName: nodeName,
    attributes: attributes,
    children: Array.isArray(children) ? children : [children]
  }
}

function Wrap(data, children) {
  var key = data.key;
  return h$1("div", { class: "-row" }, [
    key && h$1("span", { class: "-key" }, key),
    children
  ])
}

function Pair(data, classList) {
  return Wrap(data, h$1("span", { class: classList }, data.value + ""))
}

function Switch(data, path, expanded) {
  var value = data.value;
  switch (typeof value) {
    case "boolean":
      return Pair(data, "-boolean")
    case "function":
      return Wrap(data, h$1("span", { class: "-function" }))
    case "number":
      return Pair(data, "-number")
    case "object":
      return Wrap(
        data,
        value
          ? Array.isArray(value)
            ? Arr(value, path, expanded)
            : Obj(value, path, expanded)
          : h$1("span", { class: "-null" })
      )
    case "string":
      return Pair(data, "-string")
    case "undefined":
      return Wrap(data, h$1("span", { class: "-undefined" }))
  }
  return Pair(data)
}

function Expand(path, expanded) {
  return (
    expanded &&
    h$1("span", {
      class: "-expand",
      onclick: function() {
        expanded(path, true);
      }
    })
  )
}

function Collapse(path, expanded) {
  return (
    expanded &&
    h$1("span", {
      class: "-collapse",
      onclick: function() {
        expanded(path, false);
      }
    })
  )
}

function Arr(value, path, expanded) {
  if (expanded && !expanded(path)) {
    return h$1("span", { class: "-array" }, Expand(path, expanded))
  }
  var result = [Collapse(path, expanded)];
  for (var i = 0; i < value.length; i++) {
    result.push(Switch({ value: value[i] }, path + "." + i, expanded));
  }
  return h$1("span", { class: "-array" }, result)
}

function Obj(value, path, expanded) {
  if (expanded && !expanded(path)) {
    return h$1("span", { class: "-object" }, Expand(path, expanded))
  }
  var keys = Object.keys(value);
  var result = [Collapse(path, expanded)];
  // TODO later :)
  // if (
  //   value.constructor &&
  //   value.constructor.name &&
  //   value.constructor.name !== "Object"
  // ) {
  //   result.push(`${value.constructor.name} `)
  // }
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    result.push(
      Switch({ key: key, value: value[key] }, path + "." + key, expanded)
    );
  }
  return h$1("span", { class: "-object" }, result)
}

function ObjectView(props) {
  props.path = props.path || "root";
  return h$1(
    "div",
    { class: "_object-view" },
    Switch(props, props.path, props.expanded)
  )
}

function Pane(props, value) {
    var state = props.state, actions = props.actions;
    function expanded(path, expanded) {
        var result = isValueDisplayExpanded(state, path);
        if (typeof expanded === "boolean") {
            actions.setDetailsPaneExpanded({
                expanded: !result,
                path: path
            });
        }
        return result;
    }
    return (h("div", { class: "object-details-pane scrollable" }, ObjectView({ value: value, expanded: expanded })));
}
function PaneData(props) {
    var event = props.event;
    if (event.type === "action") {
        return Pane(props, event.data);
    }
    throw new Error("Expected action event but got: " + event.type);
}
function PaneResult(props) {
    var event = props.event;
    if (event.type === "action") {
        return Pane(props, event.result);
    }
    if (event.type === "function") {
        return Pane(props, event.result);
    }
    throw new Error("Expected action or function event but got: " + event.type);
}
function PaneState(props) {
    var event = props.event;
    if (event.type === "action") {
        return Pane(props, event.stateAfter);
    }
    if (event.type === "init") {
        return Pane(props, event.state);
    }
    throw new Error("Expected action or init event but got: " + event.type);
}
function PaneArgs(props) {
    var event = props.event;
    if (event.type === "function") {
        return Pane(props, event.args);
    }
    throw new Error("Expected function event but got: " + event.type);
}
function PaneMessage(props) {
    var event = props.event;
    if (event.type === "message") {
        return Pane(props, event.message);
    }
    throw new Error("Expected message event but got: " + event.type);
}
function PaneDebuggerState(props) {
    return Pane(props, props.state);
}
function ObjectDetailsPane(props) {
    var state = props.state, actions = props.actions;
    var event = getSelectedEvent(props.state);
    switch (props.state.valueDisplay) {
        case "args":
            return PaneArgs({ state: state, actions: actions, event: event });
        case "data":
            return PaneData({ state: state, actions: actions, event: event });
        case "result":
            return PaneResult({ state: state, actions: actions, event: event });
        case "message":
            return PaneMessage({ state: state, actions: actions, event: event });
        case "state":
            return PaneState({ state: state, actions: actions, event: event });
        case "debugger-state":
            return PaneDebuggerState({ state: state, actions: actions, event: event });
    }
}

var css$12 = ".runs-pane {\n  flex: 0 0 40%;\n  border: 1px solid #000000;\n  margin: 0.1rem;\n  align-items: stretch; }\n  .runs-pane .runs-pane-runs {\n    margin: 0.2rem 0rem 0.4rem 0.2rem;\n    padding: 0; }\n";
styleInject(css$12);

var css$14 = ".run-pane-item {\n  list-style-type: none;\n  width: 100%; }\n  .run-pane-item h2 {\n    font-size: 1.2rem;\n    margin: 0.2rem 0 0.2rem 0; }\n";
styleInject(css$14);

var css$16 = ".run-event-count {\n  color: #ff6600; }\n\n.run-event {\n  margin: 0rem;\n  width: 100%; }\n  .run-event .item-link {\n    display: block;\n    color: #000000; }\n    .run-event .item-link:hover {\n      background-color: #d3e5fd;\n      text-decoration: none;\n      color: #000000; }\n    .run-event .item-link:focus {\n      text-decoration: none; }\n    .run-event .item-link.selected {\n      background-color: #9fbbdf;\n      font-weight: bold;\n      color: #000000; }\n  .run-event .icon:hover {\n    color: #3834ff; }\n";
styleInject(css$16);

// # Helpers
function getRepeatText(run, events, index) {
    var event = run.eventsById[events[index]];
    var result = 1;
    var i = index - 1;
    while (i >= 0) {
        var previous = run.eventsById[events[i]];
        if (previous.name === event.name && previous.type === event.type) {
            result++;
            i--;
        }
        else {
            return result === 1 ? "" : " (x" + result + ")";
        }
    }
    return result === 1 ? "" : " (x" + result + ")";
}
function getArgumentText(arg) {
    if (arg &&
        typeof arg === "object" &&
        arg.constructor &&
        arg.constructor.name !== "Object") {
        return arg.constructor.name;
    }
    return JSON.stringify(arg);
}
var MAX_LENGTH = 20;
function getArgumentsText(args) {
    var result = "";
    for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        var text = (result +=
            getArgumentText(arg) + (i < args.length - 1 ? ", " : ""));
        if (result.length === MAX_LENGTH) {
            return result;
        }
        else if (result.length > MAX_LENGTH) {
            return result.substring(0, MAX_LENGTH - 3) + "...";
        }
    }
    return result;
}
function getDisplayName(event) {
    switch (event.type) {
        case "init":
            return "Initial State";
        case "action":
            return event.name + "(" + getArgumentsText(typeof event.data === "undefined" ? [] : [event.data]) + ")";
        case "function":
            return "f " + event.name + "(" + getArgumentsText(event.args) + ")";
        case "message":
            return "[" + event.level + "] " + truncate(event.message);
    }
}
function ToggleEvent(props) {
    var actions = props.actions, run = props.run, event = props.event;
    if (!event.children || event.children.length === 0) {
        return h(Icon, { name: "empty" });
    }
    var onclick = function (e) {
        e.stopPropagation();
        e.preventDefault();
        actions.toggleEvent({ runId: run.id, eventId: event.id });
    };
    if (event.collapsed) {
        return h(Icon, { name: "caret-right", onclick: onclick });
    }
    return h(Icon, { name: "caret-bottom", onclick: onclick });
}
function EventLink(props) {
    var state = props.state, actions = props.actions, run = props.run, events = props.events, indexInList = props.indexInList, event = props.event;
    var selected = isSelectedEvent(state, event);
    var className = "item-link" + (selected ? " selected" : "");
    var onclick = function (e) {
        e.preventDefault();
        actions.select({ runId: run.id, eventId: event.id });
    };
    var displayName = getDisplayName(event);
    return (h("a", { href: "", class: className, onclick: onclick },
        ToggleEvent(props),
        displayName,
        state.collapseRepeatingEvents && (h("span", { class: "run-event-count" }, getRepeatText(run, events, indexInList)))));
}
function RunEvent(props) {
    var state = props.state, actions = props.actions, run = props.run, events = props.events, indexInList = props.indexInList, event = props.event;
    var nextEvent = run.eventsById[events[indexInList + 1]];
    if (nextEvent &&
        nextEvent.name === event.name &&
        nextEvent.type === event.type &&
        state.collapseRepeatingEvents) {
        return null;
    }
    return (h("li", { class: "run-event", key: indexInList },
        EventLink(props),
        event.children &&
            !event.collapsed &&
            RunEventList({
                state: state,
                actions: actions,
                run: run,
                events: event.children
            })));
}

var css$18 = ".run-event-list {\n  list-style-type: none;\n  margin: 0 0 0 0.6rem;\n  padding: 0; }\n";
styleInject(css$18);

function RunEventList(props) {
    var state = props.state, actions = props.actions, run = props.run, events = props.events;
    if (events.length === 0) {
        return null;
    }
    return (h("ul", { class: "run-event-list" }, events
        .map(function (event, indexInList) {
        return RunEvent({
            state: state,
            actions: actions,
            events: run.events,
            event: run.eventsById[event],
            indexInList: indexInList,
            run: run
        });
    })
        .reverse()));
}

function RunsPaneItem(props) {
    var state = props.state, actions = props.actions, run = props.run;
    var date = new Date(run.timestamp).toLocaleTimeString();
    var collapsed = run.collapsed;
    return (h("li", { class: "run-pane-item", key: run.timestamp },
        h("h2", null,
            "Run - ",
            date),
        !collapsed &&
            RunEventList({
                run: run,
                state: state,
                actions: actions,
                events: run.events
            })));
}

function RunsPane(props) {
    var state = props.state, actions = props.actions, runs = props.runs;
    var items = [];
    var lastId = runs.length - 1;
    runs.forEach(function (run, i) {
        items.unshift(RunsPaneItem({ state: state, actions: actions, run: run, current: i === lastId }));
    });
    return (h("div", { class: "runs-pane scrollable" },
        h("ul", { class: "runs-pane-runs scrollable-content" }, items)));
}

function DebugPaneContent(props) {
    var state = props.state, actions = props.actions;
    var runs = state.runs.map(function (id) { return state.runsById[id]; });
    if (runs.length === 0) {
        return (h("div", { class: "debug-pane-content" },
            h("p", null, "No debug information found, please debug this project.")));
    }
    return (h("div", { class: "debug-pane-content" },
        RunsPane({ state: state, actions: actions, runs: runs }),
        ObjectDetailsPane({ state: state, actions: actions })));
}

var css$20 = ".debug-pane {\n  display: flex;\n  flex-direction: column;\n  width: 100%;\n  height: 100%;\n  background: #ffffff;\n  border: 1px solid #000000;\n  color: #000000; }\n  .debug-pane a {\n    text-decoration: none; }\n";
styleInject(css$20);

function DebugPane(props) {
    var state = props.state, actions = props.actions;
    return (h("div", { class: "hyperapp-devtools debug-pane" },
        DebugPaneToolbar({ state: state, actions: actions }),
        DebuggerOptions({ state: state, actions: actions }),
        DebugPaneContent({ state: state, actions: actions })));
}

var css$22 = ".toggle-pane-button {\n  position: fixed;\n  right: 2%;\n  bottom: 2%; }\n";
styleInject(css$22);

function TogglePaneButton(props) {
    var state = props.state, actions = props.actions;
    return (h("div", { class: "hyperapp-devtools toggle-pane-button" },
        h("button", { onclick: function () { return actions.showPane(!state.paneShown); } }, "Devtools")));
}

function getClassName(display) {
    switch (display) {
        case "fullscreen":
            return "devtools-overlay";
        case "right":
            return "devtools-overlay align-right";
        case "bottom":
            return "devtools-overlay align-bottom";
    }
}
function view(state, actions) {
    if (state.paneShown) {
        return (h("div", { class: getClassName(state.paneDisplay) },
            DebugPane({ state: state, actions: actions }),
            TogglePaneButton({ state: state, actions: actions })));
    }
    return TogglePaneButton({ state: state, actions: actions });
}

var state = {
    runs: [],
    runsById: {},
    paneDisplay: "right",
    valueDisplay: "state",
    paneShown: false,
    selectedEvent: null,
    collapseRepeatingEvents: true,
    detailsPaneExpandedPaths: {}
};

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */



var __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
};

var deleteRun = function (id) { return function (state) {
    var runsById = __assign({}, state.runsById);
    delete runsById[id];
    var runs = state.runs.filter(function (s) { return s !== id; });
    return { runs: runs, runsById: runsById };
}; };

/**
 * Get the value at the given path in the given target, or undefined if path doesn't exists.
 */
function get(target, path) {
    var result = target;
    for (var i = 0; i < path.length; i++) {
        result = result ? result[path[i]] : result;
    }
    return result;
}
/**
 * Immutable set: set the value at the given path in the given target and returns a new target.
 * Creates the necessary objects/arrays if the path doesn't exist.
 */
function set(target, path, value) {
    if (path.length === 0) {
        return value;
    }
    return assign(Array.isArray(target) ? [] : {}, target, (_a = {},
        _a[path[0]] = path.length > 1 ? set(target[path[0]] || {}, path.slice(1), value) : value,
        _a));
    var _a;
}
/**
 * Immutable merge: merges the given value and the existing value (if any) at the path in the target using Object.assign() and return a new target.
 * Creates the necessary objects/arrays if the path doesn't exist.
 */
function merge(target, path, value) {
    return set(target, path, assign(Array.isArray(value) ? [] : {}, get(target, path), value));
}
function assign(target, obj, obj2) {
    for (var i in obj) {
        target[i] = obj[i];
    }
    for (var i in obj2) {
        target[i] = obj2[i];
    }
    return target;
}

var logCallEnd = function (payload) { return function (state) {
    var runId = payload.runId, eventId = payload.eventId, result = payload.result, error = payload.error;
    var runsById = __assign({}, state.runsById);
    var run = __assign({}, runsById[runId]);
    runsById[runId] = run;
    run.eventsById = __assign({}, run.eventsById);
    var event = __assign({}, run.eventsById[eventId]);
    run.eventsById[eventId] = event;
    // update the event
    if (event.type === "action" || event.type === "function") {
        if (result) {
            event.result = result;
            if (event.type === "action" && !result.then) {
                // update the run's current state
                var path = event.name.split(".");
                path.pop();
                event.stateAfter = merge(event.stateBefore, path, event.result);
            }
        }
        if (error) {
            event.error = error;
        }
    }
    // update the current event of the run
    run.currentEvent =
        eventId === run.currentEvent ? event.parent : run.currentEvent;
    return { runsById: runsById };
}; };

function getEvent(state, run, payload) {
    var args = payload.args, eventId = payload.eventId, name = payload.name, runId = payload.runId, type = payload.type;
    if (type === "action") {
        return {
            type: "action",
            id: eventId,
            name: name,
            data: args && args.length > 0 ? args[0] : undefined,
            parent: run.currentEvent,
            children: [],
            collapsed: false,
            stateBefore: run.currentState
        };
    }
    return {
        type: "function",
        id: eventId,
        name: name,
        args: args,
        children: [],
        collapsed: false,
        parent: run.currentEvent
    };
}
var logCallStart = function (payload) { return function (state) {
    var runId = payload.runId, eventId = payload.eventId;
    var runsById = __assign({}, state.runsById);
    var run = __assign({}, runsById[runId]);
    runsById[runId] = run;
    run.eventsById[eventId] = getEvent(state, run, payload);
    var parentId = run.currentEvent;
    if (parentId) {
        // append the event to the parent
        var parent_1 = __assign({}, run.eventsById[parentId]);
        run.eventsById[parentId] = parent_1;
        parent_1.children = parent_1.children.concat(eventId);
    }
    else {
        // append the event to the run
        run.events = run.events.concat(eventId);
    }
    run.currentEvent = eventId;
    return { runsById: runsById };
}; };

var logInit = function (payload) { return function (state) {
    var runId = payload.runId, interop = payload.interop, timestamp = payload.timestamp;
    var runs = state.runs.concat(runId);
    var runsById = __assign({}, state.runsById);
    var initEvent = {
        id: runId,
        type: "init",
        name: "Initial State",
        state: payload.state
    };
    runsById[runId] = {
        id: runId,
        events: [runId],
        eventsById: (_a = {}, _a[runId] = initEvent, _a),
        currentState: payload.state,
        timestamp: timestamp,
        interop: interop,
        collapsed: false
    };
    return {
        runs: runs,
        runsById: runsById,
        selectedEvent: {
            runId: runId,
            eventId: runId
        }
    };
    var _a;
}; };

var logMessage = function (payload) { return function (state) {
    var runId = payload.runId, eventId = payload.eventId, level = payload.level, message = payload.message;
    var runsById = __assign({}, state.runsById);
    var run = __assign({}, runsById[runId]);
    runsById[runId] = run;
    run.events = run.events.concat(eventId);
    run.eventsById = __assign({}, run.eventsById, (_a = {}, _a[eventId] = {
        type: "message",
        level: level,
        message: message,
        name: level,
        id: eventId,
        parent: run.currentEvent
    }, _a));
    return {
        runsById: runsById,
        selectedEvent: {
            runId: runId,
            eventId: eventId
        }
    };
    var _a;
}; };

var ALLOWED_VALUE_DISPLAY = {
    action: {
        state: true,
        result: true,
        data: true,
        "debugger-state": true
    },
    function: {
        args: true,
        result: true,
        "debugger-state": true
    },
    init: {
        state: true,
        "debugger-state": true
    },
    message: {
        message: true,
        "debugger-state": true
    }
};
var DEFAULT_VALUE_DISPLAYS = {
    action: "state",
    function: "result",
    init: "state",
    message: "message"
};
function sanitizeValueDisplay(valueDisplay, event) {
    if (!ALLOWED_VALUE_DISPLAY[event.type][valueDisplay]) {
        return DEFAULT_VALUE_DISPLAYS[event.type];
    }
    return valueDisplay;
}
var select = function (selectedEvent) { return function (state) {
    var event = getSelectedEvent(state, selectedEvent);
    return {
        selectedEvent: selectedEvent,
        valueDisplay: sanitizeValueDisplay(state.valueDisplay, event)
    };
}; };

var setDetailsPaneExpanded = function (payload) { return function (state) {
    var path = payload.path, expanded = payload.expanded;
    return {
        detailsPaneExpandedPaths: __assign({}, state.detailsPaneExpandedPaths, (_a = {}, _a[path] = expanded, _a))
    };
    var _a;
}; };

var setPaneDisplay = function (paneDisplay) { return function (state) { return ({
    paneDisplay: paneDisplay
}); }; };

var setValueDisplay = function (valueDisplay) { return function (state) { return ({
    valueDisplay: valueDisplay
}); }; };

var showPane = function (paneShown) { return function (state) { return ({
    paneShown: paneShown
}); }; };

var injectedSetState = "$__SET_STATE";

var timeTravel = function (selectedEvent) { return function (state) {
    var run = getRun(state, selectedEvent.runId);
    if (!run) {
        return;
    }
    var event = getSelectedEvent(state, selectedEvent);
    if (event) {
        if (event.type === "action" && event.stateAfter) {
            run.interop[injectedSetState](event.stateAfter);
            return;
        }
        if (event.type === "init") {
            run.interop[injectedSetState](event.state);
        }
    }
}; };

var toggleCollapseRepeatingEvents = function () { return function (state) { return ({
    collapseRepeatingEvents: !state.collapseRepeatingEvents
}); }; };

var toggleEvent = function (payload) { return function (state) {
    var runId = payload.runId, eventId = payload.eventId;
    // const collapsed = state.runsById[runId].eventsById[eventId].collapsed
    var collapsed = get(state.runsById, [
        runId,
        "eventsById",
        eventId,
        "collapsed"
    ]);
    // state.runsById[runId].eventsById[eventId].collapsed = !collapsed
    return {
        runsById: set(state.runsById, [runId, "eventsById", eventId, "collapsed"], !collapsed)
    };
}; };

var toggleRun = function (id) { return function (state) {
    var runsById = __assign({}, state.runsById);
    runsById[id] = __assign({}, runsById[id], { collapsed: !runsById[id].collapsed });
    return { runsById: runsById };
}; };



var actions = Object.freeze({
	deleteRun: deleteRun,
	logCallEnd: logCallEnd,
	logCallStart: logCallStart,
	logInit: logInit,
	logMessage: logMessage,
	select: select,
	setDetailsPaneExpanded: setDetailsPaneExpanded,
	setPaneDisplay: setPaneDisplay,
	setValueDisplay: setValueDisplay,
	showPane: showPane,
	timeTravel: timeTravel,
	toggleCollapseRepeatingEvents: toggleCollapseRepeatingEvents,
	toggleEvent: toggleEvent,
	toggleRun: toggleRun
});

function enhanceActions(hoaActions, runId, actions, prefix) {
    var result = {};
    var namespace = prefix ? prefix + "." : "";
    Object.keys(actions || {}).forEach(function (name) {
        var action = actions[name];
        if (!action) {
            result[name] = null;
            return;
        }
        var fnName = action.name || name;
        var namedspacedName = namespace + fnName;
        if (typeof action === "function") {
            result[name] = function (data) {
                return function (state, actions) {
                    var eventId = guid();
                    hoaActions.logCallStart({
                        type: "action",
                        name: namedspacedName,
                        args: [data],
                        eventId: eventId,
                        runId: runId
                    });
                    try {
                        var result_1 = action(data);
                        result_1 =
                            typeof result_1 === "function" ? result_1(state, actions) : result_1;
                        hoaActions.logCallEnd({
                            runId: runId,
                            eventId: eventId,
                            result: result_1
                        });
                        return result_1;
                    }
                    catch (error) {
                        hoaActions.logCallEnd({
                            runId: runId,
                            eventId: eventId,
                            error: error
                        });
                        throw error;
                    }
                };
            };
        }
        else {
            result[name] = enhanceActions(hoaActions, runId, action, namedspacedName);
        }
    });
    return result;
}

var devtoolsApp;

function devtools(app) {
    var div = document.createElement("div");
    document.body.appendChild(div);
    devtoolsApp = app(state, actions, view, div);
    return function (state$$1, actions, view$$1, element) {
        var runId = guid();
        actions[injectedSetState] = function timeTravel(state$$1) {
            return state$$1;
        };
        actions = enhanceActions(devtoolsApp, runId, actions);
        var interop = app(state$$1, actions, view$$1, element);
        devtoolsApp.logInit({
            runId: runId,
            state: state$$1,
            timestamp: new Date().getTime(),
            interop: interop
        });
        return interop;
    };
}

exports.devtools = devtools;
exports.debug = debug;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=hyperapp-devtools.js.map
