(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.devtools = {})));
}(this, (function (exports) { 'use strict';

var state = {
    runs: {},
    logs: [],
    paneShown: false,
    selectedState: null,
    collapseRepeatingActions: true,
    showFullState: true
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

function getLatestState(action) {
    return action.states[action.states.length - 1];
}
function mergeResult(state, event) {
    if (event && event.result) {
        var action = event.action.split(".");
        action.pop();
        return merge(state, action, event.result);
    }
    return state;
}
function createAction(state, collapsed, existing) {
    if (existing === void 0) { existing = {}; }
    return {
        name: existing.name || "Initial State",
        states: (existing.states || []).concat([state]),
        collapsed: collapsed
    };
}
var actions = {
    log: function (event) { return function (state) {
        if (event.type === "INITIALIZE") {
            var runs = __assign({}, state.runs);
            var appState = { state: event.state };
            runs[event.id] = {
                id: event.id,
                timestamp: event.timestamp,
                actions: [createAction(appState, state.collapseRepeatingActions)],
                collapsed: false
            };
            return { runs: runs, selectedState: appState };
        }
        else if (event.type === "ACTION") {
            var runs = __assign({}, state.runs);
            var run = runs[event.id];
            var actions_1 = run.actions.slice();
            var prevAction = actions_1.pop();
            var prevState = getLatestState(prevAction);
            var appState = void 0;
            if (prevAction.name === event.action) {
                // append to previous action
                appState = {
                    state: mergeResult(prevState.state, event),
                    actionData: event.data,
                    actionResult: event.result,
                    previousState: prevState.state
                };
                var action = createAction(appState, state.collapseRepeatingActions, prevAction);
                runs[event.id] = {
                    id: event.id,
                    timestamp: runs[event.id].timestamp,
                    collapsed: run.collapsed,
                    actions: actions_1.concat([action])
                };
            }
            else {
                // create new action
                appState = {
                    state: mergeResult(prevState.state, event),
                    actionData: event.data,
                    actionResult: event.result,
                    previousState: prevState.state
                };
                var action = createAction(appState, state.collapseRepeatingActions, {
                    name: event.action
                });
                runs[event.id] = {
                    id: event.id,
                    timestamp: runs[event.id].timestamp,
                    collapsed: run.collapsed,
                    actions: actions_1.concat([prevAction, action])
                };
            }
            return { runs: runs, selectedState: appState };
        }
        else if (event.type === "RUNTIME") {
            return { logs: state.logs.concat([event]) };
        }
        else {
            console.log("Error, got unexpected event: ", event);
        }
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
    select: function (selectedState) {
        return { selectedState: selectedState };
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

exports.state = state;
exports.actions = actions;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=hyperapp-devtools.js.map
