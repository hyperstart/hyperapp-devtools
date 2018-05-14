(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.devtools = factory());
}(this, (function () { 'use strict';

var state = {
    runs: {},
    logs: [],
    paneDisplay: "right",
    valueDisplay: "state",
    paneShown: false,
    selectedAction: null,
    collapseRepeatingActions: true
};
//# sourceMappingURL=state.js.map

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
//# sourceMappingURL=immutable.js.map

function compareRuns(r1, r2) {
    return r1.timestamp - r2.timestamp;
}
function getRuns(state) {
    return Object.keys(state.runs)
        .map(function (key) { return state.runs[key]; })
        .sort(compareRuns);
}
function getSelectedAction(state) {
    if (!state.selectedAction) {
        return null;
    }
    var _a = state.selectedAction, run = _a.run, path = _a.path;
    return get(state.runs, getPath(run, path));
}
function getPath(run, path) {
    var result = [run];
    path.forEach(function (index) {
        result.push("actions", index);
    });
    return result;
}
function isSelectedAction(state, run, path) {
    if (!state.selectedAction) {
        return false;
    }
    var a = state.selectedAction;
    if (run !== a.run) {
        return false;
    }
    if (path.length !== a.path.length) {
        return false;
    }
    return path.every(function (val, i) { return val === a.path[i]; });
}
function canTravelToSelectedAction(state, runs) {
    var action = state.selectedAction;
    if (!action || action.path.length === 0 || runs.length === 0) {
        return false;
    }
    // a nested action is selected, so it cannot be the lastest one
    // so we can time travel to it
    if (action.path.length !== 1) {
        return true;
    }
    // get last run
    var run = runs[runs.length - 1];
    if (run.actions.length === 0 || action.run !== run.id) {
        return false;
    }
    // we can time travel if not the latest action selected
    return run.actions.length - 1 !== action.path[0];
}
//# sourceMappingURL=selectors.js.map

// # State
var injectedSetState = "$__SET_STATE"; // Symbol("setState")
//# sourceMappingURL=api.js.map

function getPreviousState(action) {
    if (action.actions.length > 0) {
        var child = action.actions[action.actions.length - 1];
        return child.done ? child.nextState : child.previousState;
    }
    return action.previousState;
}
function mergeResult(action, event) {
    if (event && event.result) {
        var path = event.action.split(".");
        path.pop();
        return merge(getPreviousState(action), path, event.result);
    }
    return getPreviousState(action);
}
function isCurrentAction(action) {
    if (action.done) {
        return false;
    }
    var length = action.actions.length;
    return length === 0 || action.actions[length - 1].done;
}
/**
 * Recursively goes down the tree of actions and append the given event to the last non-done action.
 */
function appendActionEvent(action, event) {
    if (action.done) {
        return action;
    }
    // no nested action yet
    if (isCurrentAction(action)) {
        if (!event.callDone) {
            // the action calls to a nested action
            var nestedAction = {
                name: event.action,
                done: false,
                collapsed: false,
                actionData: event.data,
                actions: [],
                previousState: action.previousState,
                stateCollapses: {}
            };
            return __assign({}, action, { actions: action.actions.concat(nestedAction) });
        }
        else if (action.name === event.action) {
            // the previous call is now complete: set to done and compute the result
            return __assign({}, action, { done: true, actionResult: event.result, nextState: mergeResult(action, event) });
        }
        else {
            // error case
            console.log("Previous action is done and event.callDone", action, event);
            // TODO what to return?!
            return action;
        }
    }
    else {
        // there are already some nested actions: call recursivelly
        var nested = action.actions;
        var nestedAction = nested[nested.length - 1];
        var newNestedAction = appendActionEvent(nestedAction, event);
        if (nestedAction === newNestedAction) {
            return action;
        }
        return __assign({}, action, { actions: nested.slice(0, nested.length - 1).concat(newNestedAction) });
    }
}
function toggleAction(state, run, actionPath) {
    var path = getPath(run, actionPath);
    var existingAction = get(state.runs, path);
    if (typeof existingAction !== "object") {
        console.log("WARN: try to collapse invalid action, path: ", actionPath);
        return state;
    }
    var collapsed = !existingAction.collapsed;
    var action = __assign({}, existingAction, { collapsed: collapsed });
    var runs = set(state.runs, path, action);
    return { runs: runs };
}
var INITIAL_ACTION = "%%% INITIAL STATE %%%";
var actions = {
    log: function (event) { return function (state) {
        return { logs: state.logs.concat([event]) };
    }; },
    logInit: function (event) { return function (state) {
        var runs = __assign({}, state.runs);
        var action = {
            name: INITIAL_ACTION,
            done: true,
            collapsed: false,
            actions: [],
            previousState: null,
            nextState: event.state,
            stateCollapses: {}
        };
        runs[event.runId] = {
            id: event.runId,
            timestamp: event.timestamp,
            actions: [action],
            collapsed: false,
            interop: event.interop
        };
        return { runs: runs, selectedAction: { run: event.runId, path: [0] } };
    }; },
    logAction: function (event) { return function (state) {
        var runs = __assign({}, state.runs);
        var run = runs[event.runId];
        var actions = run.actions.slice();
        run.actions = actions;
        var prevAction = actions.pop();
        if (prevAction.done) {
            // previous action done: create new action and append
            if (!event.callDone) {
                var action = {
                    done: false,
                    collapsed: false,
                    actions: [],
                    name: event.action,
                    actionData: event.data,
                    previousState: prevAction.nextState,
                    stateCollapses: {}
                };
                actions.push(prevAction, action);
            }
            else {
                // error!, should we log it here?
                console.log("Previous action is done and event.callDone", state, event);
            }
        }
        else {
            // previous action not done: find parent action, create and append
            var action = appendActionEvent(prevAction, event);
            actions.push(action);
        }
        var selectedAction = {
            run: event.runId,
            path: [actions.length - 1]
        };
        return { runs: runs, selectedAction: selectedAction };
    }; },
    toggleRun: function (id) { return function (state) {
        var runs = __assign({}, state.runs);
        runs[id] = __assign({}, runs[id], { collapsed: !runs[id].collapsed });
        return { runs: runs };
    }; },
    toggleAction: function (payload) { return function (state) {
        var run = payload.run, path = payload.path;
        return toggleAction(state, run, path);
    }; },
    select: function (selectedAction) { return function (state) {
        return { selectedAction: selectedAction };
    }; },
    timeTravel: function (selectedAction) { return function (state) {
        var run = state.runs[selectedAction.run];
        var actionId = selectedAction.path[0];
        var nextState = run.actions[actionId].nextState;
        run.interop[injectedSetState](nextState);
        return {};
    }; },
    collapseAppAction: function (payload) { return function (state) {
        var run = payload.run, actionPath = payload.actionPath, appActionPath = payload.appActionPath, collapsed = payload.collapsed;
        var path = getPath(run, actionPath);
        path.push("stateCollapses", appActionPath);
        var runs = set(state.runs, path, collapsed);
        return { runs: runs };
    }; },
    showPane: function (paneShown) {
        return { paneShown: paneShown };
    },
    setPaneDisplay: function (paneDisplay) {
        return { paneDisplay: paneDisplay };
    },
    setValueDisplay: function (valueDisplay) {
        return { valueDisplay: valueDisplay };
    },
    toggleCollapseRepeatingActions: function () { return function (state) {
        return { collapseRepeatingActions: !state.collapseRepeatingActions };
    }; },
    deleteRun: function (id) { return function (state) {
        var runs = __assign({}, state.runs);
        delete runs[id];
        return { runs: runs };
    }; }
};
//# sourceMappingURL=actions.js.map

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
            h("input", { id: "debugger-group-actions-cb", type: "checkbox", checked: state.collapseRepeatingActions, onchange: actions.toggleCollapseRepeatingActions }),
            h("label", { for: "debugger-group-actions-cb" }, "Group repeating actions")),
        h("div", { class: "option" },
            h("select", { onchange: function (e) { return actions.setValueDisplay(e.target.value); }, value: state.valueDisplay },
                h("option", { value: "state" }, "Show Full State"),
                h("option", { value: "result" }, "Show Action Result"),
                h("option", { value: "data" }, "Show Action Data"),
                h("option", { value: "debugger-state" }, "Show Debugger Own State")))));
}
//# sourceMappingURL=DebuggerOptions.js.map

var css$4 = ".debug-pane-toolbar {\n  display: flex;\n  justify-content: space-between;\n  flex-shrink: 0;\n  width: 100%;\n  border-bottom: 1px solid #000000; }\n  .debug-pane-toolbar .toolbar-section {\n    align-items: center;\n    display: flex;\n    flex: 1 0 0; }\n    .debug-pane-toolbar .toolbar-section:not(:first-child):last-child {\n      justify-content: flex-end; }\n  .debug-pane-toolbar .view-buttons {\n    margin: 0.1rem; }\n  .debug-pane-toolbar .travel-button {\n    margin: 0.1rem;\n    align-items: center;\n    display: flex;\n    flex: 0 0 auto; }\n  .debug-pane-toolbar .close-button {\n    margin: 0.1rem 0.3rem; }\n";
styleInject(css$4);

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
//# sourceMappingURL=Icon.js.map

function DebugPaneToolbar(props) {
    var state = props.state, actions = props.actions, runs = props.runs;
    return (h("div", { class: "debug-pane-toolbar" },
        h("span", { class: "toolbar-section view-buttons" },
            h("button", { class: state.paneDisplay === "fullscreen" ? "selected" : "", onclick: function () { return actions.setPaneDisplay("fullscreen"); } }, "Full Screen"),
            h("button", { class: state.paneDisplay === "right" ? "selected" : "", onclick: function () { return actions.setPaneDisplay("right"); } }, "Right"),
            h("button", { class: state.paneDisplay === "bottom" ? "selected" : "", onclick: function () { return actions.setPaneDisplay("bottom"); } }, "Bottom")),
        h("span", { class: "toolbar-section travel-button" },
            h("button", { onclick: function () { return actions.timeTravel(state.selectedAction); }, disabled: !canTravelToSelectedAction(state, runs) }, "Travel to Action")),
        h("span", { class: "toolbar-section close-button" },
            h(Icon, { name: "cross", onclick: function () { return actions.showPane(false); } }))));
}
//# sourceMappingURL=DebugPaneToolbar.js.map

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
    var state = props.state, actions = props.actions, action = props.action;
    function expanded(path, expanded) {
        if (typeof expanded === "boolean") {
            actions.collapseAppAction({
                actionPath: state.selectedAction.path,
                run: state.selectedAction.run,
                appActionPath: path,
                collapsed: !expanded
            });
        }
        return !action.stateCollapses[path];
    }
    return (h("div", { class: "object-details-pane scrollable" }, ObjectView({ value: value, expanded: expanded })));
}
function PaneData(props) {
    return Pane(props, props.action.actionData);
}
function PaneResult(props) {
    return Pane(props, props.action.actionResult);
}
function PaneState(props) {
    return Pane(props, props.action.nextState);
}
function PaneDebuggerState(props) {
    return Pane(props, props.state);
}
function ObjectDetailsPane(props) {
    var state = props.state, actions = props.actions;
    var action = getSelectedAction(props.state);
    switch (props.state.valueDisplay) {
        case "data":
            return PaneData({ state: state, actions: actions, action: action });
        case "result":
            return PaneResult({ state: state, actions: actions, action: action });
        case "state":
            return PaneState({ state: state, actions: actions, action: action });
        case "debugger-state":
            return PaneDebuggerState({ state: state, actions: actions, action: action });
    }
}
//# sourceMappingURL=ObjectDetailsPane.js.map

var css$12 = ".runs-pane {\n  flex: 0 0 40%;\n  border: 1px solid #000000;\n  margin: 0.1rem;\n  align-items: stretch; }\n  .runs-pane .runs-pane-runs {\n    margin: 0.2rem 0rem 0.4rem 0.2rem;\n    padding: 0; }\n";
styleInject(css$12);

var css$14 = ".run-pane-item {\n  list-style-type: none;\n  width: 100%; }\n  .run-pane-item h2 {\n    font-size: 1.2rem;\n    margin: 0.2rem 0 0.2rem 0; }\n";
styleInject(css$14);

var css$16 = ".run-action-item-list {\n  list-style-type: none;\n  margin: 0 0 0 0.6rem;\n  padding: 0; }\n";
styleInject(css$16);

var css$18 = ".run-action-item-count {\n  color: #ff6600; }\n\n.run-action-item {\n  margin: 0rem;\n  width: 100%; }\n  .run-action-item .item-link {\n    display: block;\n    color: #000000; }\n    .run-action-item .item-link:hover {\n      background-color: #d3e5fd;\n      text-decoration: none;\n      color: #000000; }\n    .run-action-item .item-link:focus {\n      text-decoration: none; }\n    .run-action-item .item-link.selected {\n      background-color: #9fbbdf;\n      font-weight: bold;\n      color: #000000; }\n  .run-action-item .icon:hover {\n    color: #3834ff; }\n";
styleInject(css$18);

function getRepeatText(array, index) {
    var name = array[index].name;
    var result = 1;
    var i = index - 1;
    while (i >= 0) {
        if (name === array[i].name) {
            result++;
            i--;
        }
        else {
            return result === 1 ? "" : " (x" + result + ")";
        }
    }
    return result === 1 ? "" : " (x" + result + ")";
}
function getActionDataText(action) {
    if (typeof action.actionData === "undefined") {
        return "";
    }
    try {
        var result = JSON.stringify(action.actionData);
        if (result && result.length > 20) {
            return result.substr(0, 17) + "...";
        }
        return result || "";
    }
    catch (e) {
        console.log(e);
        return "error";
    }
}
function ToggleActionItem(props) {
    var action = props.action, run = props.run, actions$$1 = props.actions, path = props.path;
    if (action.actions.length === 0) {
        return h(Icon, { name: "empty" });
    }
    var onclick = function (e) {
        event.stopPropagation();
        event.preventDefault();
        actions$$1.toggleAction({ run: run.id, path: path });
    };
    if (action.collapsed) {
        return h(Icon, { name: "caret-right", onclick: onclick });
    }
    return h(Icon, { name: "caret-bottom", onclick: onclick });
}
function ActionItemLink(props) {
    var state = props.state, actions$$1 = props.actions, run = props.run, actionList = props.actionList, indexInList = props.indexInList, action = props.action, path = props.path;
    var selected = isSelectedAction(state, run.id, path);
    var className = "item-link" + (selected ? " selected" : "");
    var onclick = function (e) {
        e.preventDefault();
        actions$$1.select({ run: run.id, path: path });
    };
    var displayName = action.name === INITIAL_ACTION
        ? " Initial State"
        : " " + action.name + "(" + getActionDataText(action) + ")";
    return (h("a", { href: "", class: className, onclick: onclick },
        ToggleActionItem(props),
        displayName,
        state.collapseRepeatingActions && (h("span", { class: "run-action-item-count" }, getRepeatText(actionList, indexInList)))));
}
function RunActionItem(props) {
    var state = props.state, actions$$1 = props.actions, run = props.run, actionList = props.actionList, indexInList = props.indexInList, action = props.action, path = props.path;
    var nextAction = actionList[indexInList + 1];
    if (nextAction &&
        nextAction.name === action.name &&
        state.collapseRepeatingActions) {
        return null;
    }
    return (h("li", { class: "run-action-item", key: indexInList },
        ActionItemLink(props),
        RunActionItemList({
            state: state,
            actions: actions$$1,
            run: run,
            actionList: action.actions,
            path: path,
            collapsed: action.collapsed
        })));
}
//# sourceMappingURL=RunActionItem.js.map

function RunActionItemList(props) {
    var state = props.state, actions = props.actions, run = props.run, actionList = props.actionList, collapsed = props.collapsed, path = props.path;
    if (collapsed || actionList.length === 0) {
        return null;
    }
    return (h("ul", { class: "run-action-item-list" }, actionList
        .map(function (action, indexInList) {
        return RunActionItem({
            state: state,
            actions: actions,
            action: action,
            actionList: actionList,
            indexInList: indexInList,
            run: run,
            path: path.concat(indexInList)
        });
    })
        .reverse()));
}
//# sourceMappingURL=RunActionItemList.js.map

function RunsPaneItem(props) {
    var state = props.state, actions = props.actions, run = props.run;
    var date = new Date(run.timestamp).toLocaleTimeString();
    var collapsed = run.collapsed;
    return (h("li", { class: "run-pane-item", key: run.timestamp },
        h("h2", null,
            "Run - ",
            date),
        RunActionItemList({
            state: state,
            actions: actions,
            run: run,
            collapsed: collapsed,
            actionList: run.actions,
            path: []
        })));
}
//# sourceMappingURL=RunsPaneItem.js.map

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
//# sourceMappingURL=RunsPane.js.map

function DebugPaneContent(props) {
    var state = props.state, actions = props.actions, runs = props.runs;
    if (runs.length === 0) {
        return (h("div", { class: "debug-pane-content" },
            h("p", null, "No debug information found, please debug this project.")));
    }
    return (h("div", { class: "debug-pane-content" },
        RunsPane({ state: state, actions: actions, runs: runs }),
        ObjectDetailsPane({ state: state, actions: actions })));
}
//# sourceMappingURL=DebugPaneContent.js.map

var css$20 = ".debug-pane {\n  display: flex;\n  flex-direction: column;\n  width: 100%;\n  height: 100%;\n  background: #ffffff;\n  border: 1px solid #000000;\n  color: #000000; }\n  .debug-pane a {\n    text-decoration: none; }\n";
styleInject(css$20);

function DebugPane(props) {
    var state = props.state, actions = props.actions;
    var runs = getRuns(state);
    return (h("div", { class: "hyperapp-devtools debug-pane" },
        DebugPaneToolbar({ state: state, actions: actions, runs: runs }),
        DebuggerOptions({ state: state, actions: actions }),
        DebugPaneContent({ state: state, actions: actions, runs: runs })));
}
//# sourceMappingURL=DebugPane.js.map

var css$22 = ".toggle-pane-button {\n  position: fixed;\n  right: 2%;\n  bottom: 2%; }\n";
styleInject(css$22);

function TogglePaneButton(props) {
    var state = props.state, actions = props.actions;
    return (h("div", { class: "hyperapp-devtools toggle-pane-button" },
        h("button", { onclick: function () { return actions.showPane(!state.paneShown); } }, "Devtools")));
}
//# sourceMappingURL=TogglePaneButton.js.map

//# sourceMappingURL=index.js.map

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
//# sourceMappingURL=view.js.map

function enhanceActions(onAction, runId, actions, prefix) {
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
                    onAction({
                        callDone: false,
                        action: namedspacedName,
                        data: data,
                        runId: runId
                    });
                    var result = action(data);
                    result =
                        typeof result === "function" ? result(state, actions) : result;
                    onAction({
                        callDone: true,
                        action: namedspacedName,
                        data: data,
                        result: result,
                        runId: runId
                    });
                    return result;
                };
            };
        }
        else {
            result[name] = enhanceActions(onAction, runId, action, namedspacedName);
        }
    });
    return result;
}

//# sourceMappingURL=enhanceActions.js.map

var ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
var SIZE = 16;
var rand = function () { return ALPHABET[Math.floor(Math.random() * ALPHABET.length)]; };
var guid = function () {
    return Array.apply(null, Array(SIZE))
        .map(rand)
        .join("");
};
function hoa$1(app) {
    var div = document.createElement("div");
    document.body.appendChild(div);
    var devtoolsApp = app(state, actions, view, div);
    return function (state$$1, actions$$1, view$$1, element) {
        var runId = guid();
        actions$$1[injectedSetState] = function timeTravel(state$$1) { return state$$1; };
        actions$$1 = enhanceActions(devtoolsApp.logAction, runId, actions$$1);
        var interop = app(state$$1, actions$$1, view$$1, element);
        devtoolsApp.logInit({ runId: runId, state: state$$1, timestamp: new Date().getTime(), interop: interop });
        return interop;
    };
}

//# sourceMappingURL=hoa.js.map

//# sourceMappingURL=index.js.map

return hoa$1;

})));
//# sourceMappingURL=hyperapp-devtools.js.map
