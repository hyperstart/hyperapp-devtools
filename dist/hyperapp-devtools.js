(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.devtools = factory());
}(this, (function () { 'use strict';

var state = {
    runs: {},
    logs: [],
    paneShown: false,
    selectedAction: null,
    collapseRepeatingActions: true,
    showFullState: true
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
    path = typeof path === "string" ? path.split(".") : path;
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
    path = typeof path === "string" ? path.split(".") : path;
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

function mergeResult(state, event) {
    if (event && event.result) {
        var action = event.action.split(".");
        action.pop();
        return merge(state, action, event.result);
    }
    return state;
}
// function createAction(
//   state: api.AppState,
//   collapsed: boolean,
//   existing: Partial<api.AppAction> = {}
// ): api.AppAction {
//   return {
//     name: existing.name || "Initial State",
//     states: (existing.states || []).concat([state]),
//     collapsed
//   }
// }
/**
 * Recursively goes down the tree of actions and append the given event to the last non-done action.
 *
 */
function appendAction(previousAction, event) {
    if (previousAction.done) {
        return previousAction;
    }
    // no nested action yet
    if (previousAction.nestedActions.length === 0) {
        if (!event.callDone) {
            // the action calls to a nested action
            var nestedAction = {
                name: event.action,
                done: false,
                collapsed: false,
                actionData: event.data,
                nestedActions: [],
                previousState: previousAction.previousState
            };
            return __assign({}, previousAction, { nestedActions: [nestedAction] });
        }
        else if (previousAction.name === event.action) {
            // the previous call is now complete: set to done and compute the result
            return __assign({}, previousAction, { done: true, actionResult: event.result, nextState: mergeResult(previousAction.previousState, event) });
        }
        else {
            // error case
            console.log("Previous action is done and event.callDone", previousAction, event);
            // TODO what to return?!
            return previousAction;
        }
    }
    else {
        // there are already some nested actions: call recursivelly
        var nested = previousAction.nestedActions;
        var nestedAction = nested[nested.length - 1];
        var newNestedAction = appendAction(nestedAction, event);
        if (nestedAction === newNestedAction) {
            return previousAction;
        }
        return __assign({}, previousAction, { nestedActions: nested.slice(0, nested.length - 1).concat(newNestedAction) });
    }
}
var actions = {
    log: function (event) { return function (state) {
        return { logs: state.logs.concat([event]) };
    }; },
    logInit: function (event) { return function (state) {
        var runs = __assign({}, state.runs);
        var action = {
            name: "Initial State",
            done: true,
            collapsed: false,
            nestedActions: [],
            previousState: null,
            nextState: event.state
        };
        runs[event.runId] = {
            id: event.runId,
            timestamp: event.timestamp,
            actions: [action],
            collapsed: false
        };
        return { runs: runs, selectedAction: action };
    }; },
    logAction: function (event) { return function (state) {
        var runs = __assign({}, state.runs);
        var run = runs[event.runId];
        var actions = run.actions.slice();
        run.actions = actions;
        var prevAction = actions.pop();
        var selectedAction;
        if (prevAction.done) {
            // previous action done: create new action and append
            if (!event.callDone) {
                selectedAction = {
                    done: false,
                    collapsed: false,
                    nestedActions: [],
                    name: event.action,
                    actionData: event.data,
                    previousState: prevAction.nextState
                };
                actions.push(prevAction, selectedAction);
            }
            else {
                // error!, should we log it here?
                console.log("Previous action is done and event.callDone", state, event);
            }
        }
        else {
            // previous action not done: find parent action, create and append
            selectedAction = appendAction(prevAction, event);
            actions.push(selectedAction);
        }
        return { runs: runs, selectedAction: selectedAction };
    }; },
    toggleRun: function (id) { return function (state) {
        var runs = __assign({}, state.runs);
        runs[id] = __assign({}, runs[id], { collapsed: !runs[id].collapsed });
        return { runs: runs };
    }; },
    toggleAction: function (payload) { return function (state) {
        var run = payload.run, actionId = payload.actionId;
        var path = [run, "actions", actionId, "collapsed"];
        var collapsed = get(state.runs, path);
        var runs = set(state.runs, path, !collapsed);
        return { runs: runs };
    }; },
    select: function (selectedAction) {
        return { selectedAction: selectedAction };
    },
    showPane: function (paneShown) {
        return { paneShown: paneShown };
    },
    toggleCollapseRepeatingActions: function () { return function (state) {
        return { collapseRepeatingActions: !state.collapseRepeatingActions };
    }; },
    toggleShowFullState: function () { return function (state) {
        return { showFullState: !state.showFullState };
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

var css = ".debug-pane {\n  display: flex;\n  flex-direction: column;\n  width: 96%;\n  height: 96%;\n  background: #f1f1f1;\n  border: 1px solid black;\n  color: black;\n  position: fixed;\n  left: 2%;\n  top: 2%; }\n  .debug-pane .debug-toolbar {\n    width: 100%;\n    height: 1.3rem;\n    padding-top: 0.15rem;\n    padding-left: 0.15rem;\n    border-bottom: 1px solid black; }\n  .debug-pane .debug-content {\n    flex-grow: 1; }\n    .debug-pane .debug-content pre {\n      margin: 0rem; }\n";
styleInject(css);

function Toolbar(props) {
    return h("div", { class: "debug-toolbar" }, "toolbar");
}
function DebugPane(props) {
    var state = props.state, actions = props.actions;
    return (h("div", { class: "debug-pane" },
        Toolbar({ state: state, actions: actions }),
        h("div", { class: "debug-content scrollable" },
            h("pre", { class: "scrollable-content" }, JSON.stringify(state, null, 2)))));
}
//# sourceMappingURL=DebugPane.js.map

var style$1 = {
    position: "fixed",
    right: "2%",
    bottom: "2%",
    "border-radius": "0px",
    border: "1px solid black",
    color: "black",
    background: "white",
    margin: "0.2rem",
    outline: "none",
    "font-size": "2rem"
};
function TogglePaneButton(props) {
    var state = props.state, actions = props.actions;
    return (h("button", { style: style$1, onclick: function () { return actions.showPane(!state.paneShown); } }, "Devtools"));
}
//# sourceMappingURL=TogglePaneButton.js.map

var style = {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    width: "100vw",
    "z-index": 10
};
function view(state, actions) {
    if (state.paneShown) {
        return (h("div", { style: style },
            DebugPane({ state: state, actions: actions }),
            TogglePaneButton({ state: state, actions: actions })));
    }
    return TogglePaneButton({ state: state, actions: actions });
}
//# sourceMappingURL=view.js.map

var css$2 = ".scrollable {\n  display: flex;\n  flex-direction: column; }\n  .scrollable .scrollable-content {\n    overflow-x: auto;\n    overflow-y: auto;\n    min-height: 0px;\n    flex-grow: 1; }\n";
styleInject(css$2);

//# sourceMappingURL=index.js.map

function enhanceActions(onAction, runId, actions, prefix) {
    var namespace = prefix ? prefix + "." : "";
    return Object.keys(actions || {}).reduce(function (otherActions, name) {
        var namedspacedName = namespace + name;
        var action = actions[name];
        otherActions[name] =
            typeof action === "function"
                ? function (data) {
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
                }
                : enhanceActions(onAction, runId, action, namedspacedName);
        return otherActions;
    }, {});
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
    div.id = "hyperapp-devtools";
    document.body.appendChild(div);
    var devtoolsApp = app(state, actions, view, div);
    return function (state, actions, view, element) {
        var runId = guid();
        actions = enhanceActions(devtoolsApp.logAction, runId, actions);
        actions.$__SET_STATE = function (state) { return state; };
        devtoolsApp.logInit({ runId: runId, state: state, timestamp: new Date().getTime() });
        return app(state, actions, view, element);
    };
}

//# sourceMappingURL=hoa.js.map

//# sourceMappingURL=index.js.map

return hoa$1;

})));
//# sourceMappingURL=hyperapp-devtools.js.map
