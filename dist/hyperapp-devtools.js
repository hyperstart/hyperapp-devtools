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

var css = "/* Manually forked from Normalize.css */\n/* normalize.css v5.0.0 | MIT License | github.com/necolas/normalize.css */\n/**\n * 1. Change the default font family in all browsers (opinionated).\n * 2. Correct the line height in all browsers.\n * 3. Prevent adjustments of font size after orientation changes in\n *    IE on Windows Phone and in iOS.\n */\n/* Document\n   ========================================================================== */\nhtml {\n  font-family: sans-serif;\n  /* 1 */\n  -ms-text-size-adjust: 100%;\n  /* 3 */\n  -webkit-text-size-adjust: 100%;\n  /* 3 */ }\n\n/* Sections\n   ========================================================================== */\n/**\n * Remove the margin in all browsers (opinionated).\n */\nbody {\n  margin: 0; }\n\n/**\n * Add the correct display in IE 9-.\n */\narticle,\naside,\nfooter,\nheader,\nnav,\nsection {\n  display: block; }\n\n/**\n * Correct the font size and margin on `h1` elements within `section` and\n * `article` contexts in Chrome, Firefox, and Safari.\n */\nh1 {\n  font-size: 2em;\n  margin: 0.67em 0; }\n\n/* Grouping content\n   ========================================================================== */\n/**\n * Add the correct display in IE 9-.\n * 1. Add the correct display in IE.\n */\nfigcaption,\nfigure,\nmain {\n  /* 1 */\n  display: block; }\n\n/**\n * Add the correct margin in IE 8 (removed).\n */\n/**\n * 1. Add the correct box sizing in Firefox.\n * 2. Show the overflow in Edge and IE.\n */\nhr {\n  box-sizing: content-box;\n  /* 1 */\n  height: 0;\n  /* 1 */\n  overflow: visible;\n  /* 2 */ }\n\n/**\n * 1. Correct the inheritance and scaling of font size in all browsers. (removed)\n * 2. Correct the odd `em` font sizing in all browsers.\n */\n/* Text-level semantics\n   ========================================================================== */\n/**\n * 1. Remove the gray background on active links in IE 10.\n * 2. Remove gaps in links underline in iOS 8+ and Safari 8+.\n */\na {\n  background-color: transparent;\n  /* 1 */\n  -webkit-text-decoration-skip: objects;\n  /* 2 */ }\n\n/**\n * Remove the outline on focused links when they are also active or hovered\n * in all browsers (opinionated).\n */\na:active,\na:hover {\n  outline-width: 0; }\n\n/**\n * Modify default styling of address.\n */\naddress {\n  font-style: normal; }\n\n/**\n * 1. Remove the bottom border in Firefox 39-.\n * 2. Add the correct text decoration in Chrome, Edge, IE, Opera, and Safari. (removed)\n */\n/**\n * Prevent the duplicate application of `bolder` by the next rule in Safari 6.\n */\nb,\nstrong {\n  font-weight: inherit; }\n\n/**\n * Add the correct font weight in Chrome, Edge, and Safari.\n */\nb,\nstrong {\n  font-weight: bolder; }\n\n/**\n * 1. Correct the inheritance and scaling of font size in all browsers.\n * 2. Correct the odd `em` font sizing in all browsers.\n */\ncode,\nkbd,\npre,\nsamp {\n  font-family: \"SF Mono\", \"Segoe UI Mono\", \"Roboto Mono\", Menlo, Courier, monospace;\n  /* 1 (changed) */\n  font-size: 1em;\n  /* 2 */ }\n\n/**\n * Add the correct font style in Android 4.3-.\n */\ndfn {\n  font-style: italic; }\n\n/**\n * Add the correct background and color in IE 9-. (Removed)\n */\n/**\n * Add the correct font size in all browsers.\n */\nsmall {\n  font-size: 80%;\n  font-weight: 400;\n  /* (added) */ }\n\n/**\n * Prevent `sub` and `sup` elements from affecting the line height in\n * all browsers.\n */\nsub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline; }\n\nsub {\n  bottom: -0.25em; }\n\nsup {\n  top: -0.5em; }\n\n/* Embedded content\n   ========================================================================== */\n/**\n * Add the correct display in IE 9-.\n */\naudio,\nvideo {\n  display: inline-block; }\n\n/**\n * Add the correct display in iOS 4-7.\n */\naudio:not([controls]) {\n  display: none;\n  height: 0; }\n\n/**\n * Remove the border on images inside links in IE 10-.\n */\nimg {\n  border-style: none; }\n\n/**\n * Hide the overflow in IE.\n */\nsvg:not(:root) {\n  overflow: hidden; }\n\n/* Forms\n   ========================================================================== */\n/**\n * 1. Change the font styles in all browsers (opinionated).\n * 2. Remove the margin in Firefox and Safari.\n */\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  font-family: inherit;\n  /* 1 (changed) */\n  font-size: inherit;\n  /* 1 (changed) */\n  line-height: inherit;\n  /* 1 (changed) */\n  margin: 0;\n  /* 2 */ }\n\n/**\n * Show the overflow in IE.\n * 1. Show the overflow in Edge.\n */\nbutton,\ninput {\n  /* 1 */\n  overflow: visible; }\n\n/**\n * Remove the inheritance of text transform in Edge, Firefox, and IE.\n * 1. Remove the inheritance of text transform in Firefox.\n */\nbutton,\nselect {\n  /* 1 */\n  text-transform: none; }\n\n/**\n * 1. Prevent a WebKit bug where (2) destroys native `audio` and `video`\n *    controls in Android 4.\n * 2. Correct the inability to style clickable types in iOS and Safari.\n */\nbutton,\nhtml [type=\"button\"],\n[type=\"reset\"],\n[type=\"submit\"] {\n  -webkit-appearance: button;\n  /* 2 */ }\n\n/**\n * Remove the inner border and padding in Firefox.\n */\nbutton::-moz-focus-inner,\n[type=\"button\"]::-moz-focus-inner,\n[type=\"reset\"]::-moz-focus-inner,\n[type=\"submit\"]::-moz-focus-inner {\n  border-style: none;\n  padding: 0; }\n\n/**\n * Restore the focus styles unset by the previous rule (removed).\n */\n/**\n * Change the border, margin, and padding in all browsers (opinionated) (changed).\n */\nfieldset {\n  border: 0;\n  margin: 0;\n  padding: 0; }\n\n/**\n * 1. Correct the text wrapping in Edge and IE.\n * 2. Correct the color inheritance from `fieldset` elements in IE.\n * 3. Remove the padding so developers are not caught out when they zero out\n *    `fieldset` elements in all browsers.\n */\nlegend {\n  box-sizing: border-box;\n  /* 1 */\n  color: inherit;\n  /* 2 */\n  display: table;\n  /* 1 */\n  max-width: 100%;\n  /* 1 */\n  padding: 0;\n  /* 3 */\n  white-space: normal;\n  /* 1 */ }\n\n/**\n * 1. Add the correct display in IE 9-.\n * 2. Add the correct vertical alignment in Chrome, Firefox, and Opera.\n */\nprogress {\n  display: inline-block;\n  /* 1 */\n  vertical-align: baseline;\n  /* 2 */ }\n\n/**\n * Remove the default vertical scrollbar in IE.\n */\ntextarea {\n  overflow: auto; }\n\n/**\n * 1. Add the correct box sizing in IE 10-.\n * 2. Remove the padding in IE 10-.\n */\n[type=\"checkbox\"],\n[type=\"radio\"] {\n  box-sizing: border-box;\n  /* 1 */\n  padding: 0;\n  /* 2 */ }\n\n/**\n * Correct the cursor style of increment and decrement buttons in Chrome.\n */\n[type=\"number\"]::-webkit-inner-spin-button,\n[type=\"number\"]::-webkit-outer-spin-button {\n  height: auto; }\n\n/**\n * 1. Correct the odd appearance in Chrome and Safari.\n * 2. Correct the outline style in Safari.\n */\n[type=\"search\"] {\n  -webkit-appearance: textfield;\n  /* 1 */\n  outline-offset: -2px;\n  /* 2 */ }\n\n/**\n * Remove the inner padding and cancel buttons in Chrome and Safari on macOS.\n */\n[type=\"search\"]::-webkit-search-cancel-button,\n[type=\"search\"]::-webkit-search-decoration {\n  -webkit-appearance: none; }\n\n/**\n * 1. Correct the inability to style clickable types in iOS and Safari.\n * 2. Change font properties to `inherit` in Safari.\n */\n::-webkit-file-upload-button {\n  -webkit-appearance: button;\n  /* 1 */\n  font: inherit;\n  /* 2 */ }\n\n/* Interactive\n   ========================================================================== */\n/*\n * Add the correct display in IE 9-.\n * 1. Add the correct display in Edge, IE, and Firefox.\n */\ndetails,\nmenu {\n  display: block; }\n\n/*\n * Add the correct display in all browsers.\n */\nsummary {\n  display: list-item;\n  outline: none; }\n\n/* Scripting\n   ========================================================================== */\n/**\n * Add the correct display in IE 9-.\n */\ncanvas {\n  display: inline-block; }\n\n/**\n * Add the correct display in IE.\n */\ntemplate {\n  display: none; }\n\n/* Hidden\n   ========================================================================== */\n/**\n * Add the correct display in IE 10-.\n */\n[hidden] {\n  display: none; }\n\n*,\n*::before,\n*::after {\n  box-sizing: inherit; }\n\nhtml {\n  box-sizing: border-box;\n  font-size: 20px;\n  line-height: 1.5;\n  -webkit-tap-highlight-color: transparent; }\n\nbody {\n  background: #fff;\n  color: #50596c;\n  font-family: -apple-system, system-ui, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", sans-serif;\n  font-size: 0.8rem;\n  overflow-x: hidden;\n  text-rendering: optimizeLegibility; }\n\na {\n  color: #5755d9;\n  outline: none;\n  text-decoration: none; }\n  a:focus {\n    box-shadow: 0 0 0 0.1rem rgba(87, 85, 217, 0.2); }\n  a:focus, a:hover, a:active, a.active {\n    color: #4240d4;\n    text-decoration: underline; }\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  color: inherit;\n  font-weight: 500;\n  line-height: 1.2;\n  margin-bottom: .5em;\n  margin-top: 0; }\n\n.h1,\n.h2,\n.h3,\n.h4,\n.h5,\n.h6 {\n  font-weight: 500; }\n\nh1,\n.h1 {\n  font-size: 2rem; }\n\nh2,\n.h2 {\n  font-size: 1.6rem; }\n\nh3,\n.h3 {\n  font-size: 1.4rem; }\n\nh4,\n.h4 {\n  font-size: 1.2rem; }\n\nh5,\n.h5 {\n  font-size: 1rem; }\n\nh6,\n.h6 {\n  font-size: .8rem; }\n\np {\n  margin: 0 0 1rem; }\n\na,\nins,\nu {\n  text-decoration-skip: ink edges; }\n\nabbr[title] {\n  border-bottom: 0.05rem dotted;\n  cursor: help;\n  text-decoration: none; }\n\nkbd {\n  border-radius: 0.1rem;\n  line-height: 1.2;\n  padding: .1rem .15rem;\n  background: #454d5d;\n  color: #fff;\n  font-size: 0.7rem; }\n\nmark {\n  background: #ffe9b3;\n  color: #50596c;\n  border-radius: 0.1rem;\n  padding: .05rem; }\n\nblockquote {\n  border-left: 0.1rem solid #e7e9ed;\n  margin-left: 0;\n  padding: 0.4rem 0.8rem; }\n  blockquote p:last-child {\n    margin-bottom: 0; }\n\nul,\nol {\n  margin: 0.8rem 0 0.8rem 0.8rem;\n  padding: 0; }\n  ul ul,\n  ul ol,\n  ol ul,\n  ol ol {\n    margin: 0.8rem 0 0.8rem 0.8rem; }\n  ul li,\n  ol li {\n    margin-top: 0.4rem; }\n\nul {\n  list-style: disc inside; }\n  ul ul {\n    list-style-type: circle; }\n\nol {\n  list-style: decimal inside; }\n  ol ol {\n    list-style-type: lower-alpha; }\n\ndl dt {\n  font-weight: bold; }\n\ndl dd {\n  margin: 0.4rem 0 0.8rem 0; }\n\n.btn {\n  transition: all .2s ease;\n  appearance: none;\n  background: #fff;\n  border: 0.05rem solid #5755d9;\n  border-radius: 0.1rem;\n  color: #5755d9;\n  cursor: pointer;\n  display: inline-block;\n  font-size: 0.8rem;\n  height: 1.8rem;\n  line-height: 1rem;\n  outline: none;\n  padding: 0.35rem 0.4rem;\n  text-align: center;\n  text-decoration: none;\n  user-select: none;\n  vertical-align: middle;\n  white-space: nowrap; }\n  .btn:focus {\n    box-shadow: 0 0 0 0.1rem rgba(87, 85, 217, 0.2); }\n  .btn:focus, .btn:hover {\n    background: #f1f1fc;\n    border-color: #4b48d6;\n    text-decoration: none; }\n  .btn:active, .btn.active {\n    background: #4b48d6;\n    border-color: #3634d2;\n    color: #fff;\n    text-decoration: none; }\n    .btn:active.loading::after, .btn.active.loading::after {\n      border-bottom-color: #fff;\n      border-left-color: #fff; }\n  .btn[disabled], .btn:disabled, .btn.disabled {\n    cursor: default;\n    opacity: .5;\n    pointer-events: none; }\n  .btn.btn-primary {\n    background: #5755d9;\n    border-color: #4b48d6;\n    color: #fff; }\n    .btn.btn-primary:focus, .btn.btn-primary:hover {\n      background: #4240d4;\n      border-color: #3634d2;\n      color: #fff; }\n    .btn.btn-primary:active, .btn.btn-primary.active {\n      background: #3a38d2;\n      border-color: #302ecd;\n      color: #fff; }\n    .btn.btn-primary.loading::after {\n      border-bottom-color: #fff;\n      border-left-color: #fff; }\n  .btn.btn-success {\n    background: #32b643;\n    border-color: #2faa3f;\n    color: #fff; }\n    .btn.btn-success:focus {\n      box-shadow: 0 0 0 0.1rem rgba(50, 182, 67, 0.2); }\n    .btn.btn-success:focus, .btn.btn-success:hover {\n      background: #30ae40;\n      border-color: #2da23c;\n      color: #fff; }\n    .btn.btn-success:active, .btn.btn-success.active {\n      background: #2a9a39;\n      border-color: #278e34;\n      color: #fff; }\n    .btn.btn-success.loading::after {\n      border-bottom-color: #fff;\n      border-left-color: #fff; }\n  .btn.btn-error {\n    background: #e85600;\n    border-color: #d95000;\n    color: #fff; }\n    .btn.btn-error:focus {\n      box-shadow: 0 0 0 0.1rem rgba(232, 86, 0, 0.2); }\n    .btn.btn-error:focus, .btn.btn-error:hover {\n      background: #de5200;\n      border-color: #cf4d00;\n      color: #fff; }\n    .btn.btn-error:active, .btn.btn-error.active {\n      background: #c44900;\n      border-color: #b54300;\n      color: #fff; }\n    .btn.btn-error.loading::after {\n      border-bottom-color: #fff;\n      border-left-color: #fff; }\n  .btn.btn-link {\n    background: transparent;\n    border-color: transparent;\n    color: #5755d9; }\n    .btn.btn-link:focus, .btn.btn-link:hover, .btn.btn-link:active, .btn.btn-link.active {\n      color: #4240d4; }\n  .btn.btn-sm {\n    font-size: 0.7rem;\n    height: 1.4rem;\n    padding: 0.15rem 0.3rem; }\n  .btn.btn-lg {\n    font-size: 0.9rem;\n    height: 2rem;\n    padding: 0.45rem 0.6rem; }\n  .btn.btn-block {\n    display: block;\n    width: 100%; }\n  .btn.btn-action {\n    width: 1.8rem;\n    padding-left: 0;\n    padding-right: 0; }\n    .btn.btn-action.btn-sm {\n      width: 1.4rem; }\n    .btn.btn-action.btn-lg {\n      width: 2rem; }\n  .btn.btn-clear {\n    background: transparent;\n    border: 0;\n    color: currentColor;\n    height: 0.8rem;\n    line-height: 0.8rem;\n    margin-left: 0.2rem;\n    margin-right: -2px;\n    opacity: 1;\n    padding: 0;\n    text-decoration: none;\n    width: 0.8rem; }\n    .btn.btn-clear:hover {\n      opacity: .95; }\n    .btn.btn-clear::before {\n      content: \"\\2715\"; }\n\n.btn-group {\n  display: inline-flex;\n  flex-wrap: wrap; }\n  .btn-group .btn {\n    flex: 1 0 auto; }\n    .btn-group .btn:first-child:not(:last-child) {\n      border-bottom-right-radius: 0;\n      border-top-right-radius: 0; }\n    .btn-group .btn:not(:first-child):not(:last-child) {\n      border-radius: 0;\n      margin-left: -0.05rem; }\n    .btn-group .btn:last-child:not(:first-child) {\n      border-bottom-left-radius: 0;\n      border-top-left-radius: 0;\n      margin-left: -0.05rem; }\n    .btn-group .btn:focus, .btn-group .btn:hover, .btn-group .btn:active, .btn-group .btn.active {\n      z-index: 1; }\n  .btn-group.btn-group-block {\n    display: flex; }\n    .btn-group.btn-group-block .btn {\n      flex: 1 0 0; }\n\n.form-group:not(:last-child) {\n  margin-bottom: 0.4rem; }\n\nfieldset {\n  margin-bottom: 0.8rem; }\n\nlegend {\n  font-size: 0.9rem;\n  font-weight: 500;\n  margin-bottom: 0.8rem; }\n\n.form-label {\n  display: block;\n  line-height: 1rem;\n  padding: 0.4rem 0; }\n  .form-label.label-sm {\n    font-size: 0.7rem;\n    padding: 0.2rem 0; }\n  .form-label.label-lg {\n    font-size: 0.9rem;\n    padding: 0.5rem 0; }\n\n.form-input {\n  transition: all .2s ease;\n  appearance: none;\n  background: #fff;\n  background-image: none;\n  border: 0.05rem solid #caced7;\n  border-radius: 0.1rem;\n  color: #50596c;\n  display: block;\n  font-size: 0.8rem;\n  height: 1.8rem;\n  line-height: 1rem;\n  max-width: 100%;\n  outline: none;\n  padding: 0.35rem 0.4rem;\n  position: relative;\n  width: 100%; }\n  .form-input:focus {\n    box-shadow: 0 0 0 0.1rem rgba(87, 85, 217, 0.2);\n    border-color: #5755d9; }\n  .form-input::placeholder {\n    color: #acb3c2; }\n  .form-input.input-sm {\n    font-size: 0.7rem;\n    height: 1.4rem;\n    padding: 0.15rem 0.3rem; }\n  .form-input.input-lg {\n    font-size: 0.9rem;\n    height: 2rem;\n    padding: 0.45rem 0.6rem; }\n  .form-input.input-inline {\n    display: inline-block;\n    vertical-align: middle;\n    width: auto; }\n  .form-input[type=\"file\"] {\n    height: auto; }\n\ntextarea.form-input {\n  height: auto; }\n\n.form-input-hint {\n  color: #acb3c2;\n  font-size: 0.7rem;\n  margin-top: 0.2rem; }\n  .has-success .form-input-hint,\n  .is-success + .form-input-hint {\n    color: #32b643; }\n  .has-error .form-input-hint,\n  .is-error + .form-input-hint {\n    color: #e85600; }\n\n.form-select {\n  appearance: none;\n  border: 0.05rem solid #caced7;\n  border-radius: 0.1rem;\n  color: inherit;\n  font-size: 0.8rem;\n  height: 1.8rem;\n  line-height: 1rem;\n  outline: none;\n  padding: 0.35rem 0.4rem;\n  vertical-align: middle;\n  width: 100%; }\n  .form-select[size], .form-select[multiple] {\n    height: auto; }\n    .form-select[size] option, .form-select[multiple] option {\n      padding: 0.1rem 0.2rem; }\n  .form-select:not([multiple]):not([size]) {\n    background: #fff url(\"data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%204%205'%3E%3Cpath%20fill='%23667189'%20d='M2%200L0%202h4zm0%205L0%203h4z'/%3E%3C/svg%3E\") no-repeat right 0.35rem center/0.4rem 0.5rem;\n    padding-right: 1.2rem; }\n  .form-select:focus {\n    box-shadow: 0 0 0 0.1rem rgba(87, 85, 217, 0.2);\n    border-color: #5755d9; }\n  .form-select::-ms-expand {\n    display: none; }\n  .form-select.select-sm {\n    font-size: 0.7rem;\n    height: 1.4rem;\n    padding: 0.15rem 1.1rem 0.15rem 0.3rem; }\n  .form-select.select-lg {\n    font-size: 0.9rem;\n    height: 2rem;\n    padding: 0.45rem 1.4rem 0.45rem 0.6rem; }\n\n.has-icon-left,\n.has-icon-right {\n  position: relative; }\n  .has-icon-left .form-icon,\n  .has-icon-right .form-icon {\n    height: 0.8rem;\n    margin: 0 0.35rem;\n    position: absolute;\n    top: 50%;\n    transform: translateY(-50%);\n    width: 0.8rem;\n    z-index: 2; }\n\n.has-icon-left .form-icon {\n  left: 0.05rem; }\n\n.has-icon-left .form-input {\n  padding-left: 1.5rem; }\n\n.has-icon-right .form-icon {\n  right: 0.05rem; }\n\n.has-icon-right .form-input {\n  padding-right: 1.5rem; }\n\n.form-checkbox,\n.form-radio,\n.form-switch {\n  display: inline-block;\n  line-height: 1rem;\n  margin: 0.2rem 0;\n  min-height: 1.2rem;\n  padding: 0.2rem 0.4rem 0.2rem 1.2rem;\n  position: relative; }\n  .form-checkbox input,\n  .form-radio input,\n  .form-switch input {\n    clip: rect(0, 0, 0, 0);\n    height: 1px;\n    margin: -1px;\n    overflow: hidden;\n    position: absolute;\n    width: 1px; }\n    .form-checkbox input:focus + .form-icon,\n    .form-radio input:focus + .form-icon,\n    .form-switch input:focus + .form-icon {\n      box-shadow: 0 0 0 0.1rem rgba(87, 85, 217, 0.2);\n      border-color: #5755d9; }\n    .form-checkbox input:checked + .form-icon,\n    .form-radio input:checked + .form-icon,\n    .form-switch input:checked + .form-icon {\n      background: #5755d9;\n      border-color: #5755d9; }\n  .form-checkbox .form-icon,\n  .form-radio .form-icon,\n  .form-switch .form-icon {\n    transition: all .2s ease;\n    border: 0.05rem solid #caced7;\n    cursor: pointer;\n    display: inline-block;\n    position: absolute; }\n  .form-checkbox.input-sm,\n  .form-radio.input-sm,\n  .form-switch.input-sm {\n    font-size: 0.7rem;\n    margin: 0; }\n  .form-checkbox.input-lg,\n  .form-radio.input-lg,\n  .form-switch.input-lg {\n    font-size: 0.9rem;\n    margin: 0.3rem 0; }\n\n.form-checkbox .form-icon,\n.form-radio .form-icon {\n  background: #fff;\n  height: 0.8rem;\n  left: 0;\n  top: 0.3rem;\n  width: 0.8rem; }\n\n.form-checkbox input:active + .form-icon,\n.form-radio input:active + .form-icon {\n  background: #f0f1f4; }\n\n.form-checkbox .form-icon {\n  border-radius: 0.1rem; }\n\n.form-checkbox input:checked + .form-icon::before {\n  background-clip: padding-box;\n  border: 0.1rem solid #fff;\n  border-left-width: 0;\n  border-top-width: 0;\n  content: \"\";\n  height: 12px;\n  left: 50%;\n  margin-left: -4px;\n  margin-top: -8px;\n  position: absolute;\n  top: 50%;\n  transform: rotate(45deg);\n  width: 8px; }\n\n.form-checkbox input:indeterminate + .form-icon {\n  background: #5755d9;\n  border-color: #5755d9; }\n  .form-checkbox input:indeterminate + .form-icon::before {\n    background: #fff;\n    content: \"\";\n    height: 2px;\n    left: 50%;\n    margin-left: -5px;\n    margin-top: -1px;\n    position: absolute;\n    top: 50%;\n    width: 10px; }\n\n.form-radio .form-icon {\n  border-radius: 50%; }\n\n.form-radio input:checked + .form-icon::before {\n  background: #fff;\n  border-radius: 50%;\n  content: \"\";\n  height: 4px;\n  left: 50%;\n  position: absolute;\n  top: 50%;\n  transform: translate(-50%, -50%);\n  width: 4px; }\n\n.form-switch {\n  padding-left: 2rem; }\n  .form-switch .form-icon {\n    background: #e7e9ed;\n    background-clip: padding-box;\n    border-radius: 0.45rem;\n    height: 0.9rem;\n    left: 0;\n    top: 0.25rem;\n    width: 1.6rem; }\n    .form-switch .form-icon::before {\n      transition: all .2s ease;\n      background: #fff;\n      border-radius: 50%;\n      content: \"\";\n      display: block;\n      height: 0.8rem;\n      left: 0;\n      position: absolute;\n      top: 0;\n      width: 0.8rem; }\n  .form-switch input:checked + .form-icon::before {\n    left: 14px; }\n  .form-switch input:active + .form-icon::before {\n    background: #f8f9fa; }\n\n.input-group {\n  display: flex; }\n  .input-group .input-group-addon {\n    background: #f8f9fa;\n    border: 0.05rem solid #caced7;\n    border-radius: 0.1rem;\n    line-height: 1rem;\n    padding: 0.35rem 0.4rem;\n    white-space: nowrap; }\n    .input-group .input-group-addon.addon-sm {\n      font-size: 0.7rem;\n      padding: 0.15rem 0.3rem; }\n    .input-group .input-group-addon.addon-lg {\n      font-size: 0.9rem;\n      padding: 0.45rem 0.6rem; }\n  .input-group .form-input,\n  .input-group .form-select {\n    flex: 1 1 auto; }\n  .input-group .input-group-btn {\n    z-index: 1; }\n  .input-group .form-input:first-child:not(:last-child),\n  .input-group .form-select:first-child:not(:last-child),\n  .input-group .input-group-addon:first-child:not(:last-child),\n  .input-group .input-group-btn:first-child:not(:last-child) {\n    border-bottom-right-radius: 0;\n    border-top-right-radius: 0; }\n  .input-group .form-input:not(:first-child):not(:last-child),\n  .input-group .form-select:not(:first-child):not(:last-child),\n  .input-group .input-group-addon:not(:first-child):not(:last-child),\n  .input-group .input-group-btn:not(:first-child):not(:last-child) {\n    border-radius: 0;\n    margin-left: -0.05rem; }\n  .input-group .form-input:last-child:not(:first-child),\n  .input-group .form-select:last-child:not(:first-child),\n  .input-group .input-group-addon:last-child:not(:first-child),\n  .input-group .input-group-btn:last-child:not(:first-child) {\n    border-bottom-left-radius: 0;\n    border-top-left-radius: 0;\n    margin-left: -0.05rem; }\n  .input-group .form-input:focus,\n  .input-group .form-select:focus,\n  .input-group .input-group-addon:focus,\n  .input-group .input-group-btn:focus {\n    z-index: 2; }\n  .input-group .form-select {\n    width: auto; }\n  .input-group.input-inline {\n    display: inline-flex; }\n\n.has-success .form-input, .form-input.is-success, .has-success\n.form-select,\n.form-select.is-success {\n  border-color: #32b643; }\n  .has-success .form-input:focus, .form-input.is-success:focus, .has-success\n  .form-select:focus,\n  .form-select.is-success:focus {\n    box-shadow: 0 0 0 0.1rem rgba(50, 182, 67, 0.2); }\n\n.has-error .form-input, .form-input.is-error, .has-error\n.form-select,\n.form-select.is-error {\n  border-color: #e85600; }\n  .has-error .form-input:focus, .form-input.is-error:focus, .has-error\n  .form-select:focus,\n  .form-select.is-error:focus {\n    box-shadow: 0 0 0 0.1rem rgba(232, 86, 0, 0.2); }\n\n.has-error .form-checkbox .form-icon, .form-checkbox.is-error .form-icon, .has-error\n.form-radio .form-icon,\n.form-radio.is-error .form-icon, .has-error\n.form-switch .form-icon,\n.form-switch.is-error .form-icon {\n  border-color: #e85600; }\n\n.has-error .form-checkbox input:checked + .form-icon, .form-checkbox.is-error input:checked + .form-icon, .has-error\n.form-radio input:checked + .form-icon,\n.form-radio.is-error input:checked + .form-icon, .has-error\n.form-switch input:checked + .form-icon,\n.form-switch.is-error input:checked + .form-icon {\n  background: #e85600;\n  border-color: #e85600; }\n\n.has-error .form-checkbox input:focus + .form-icon, .form-checkbox.is-error input:focus + .form-icon, .has-error\n.form-radio input:focus + .form-icon,\n.form-radio.is-error input:focus + .form-icon, .has-error\n.form-switch input:focus + .form-icon,\n.form-switch.is-error input:focus + .form-icon {\n  box-shadow: 0 0 0 0.1rem rgba(232, 86, 0, 0.2);\n  border-color: #e85600; }\n\n.form-input:not(:placeholder-shown):invalid {\n  border-color: #e85600; }\n  .form-input:not(:placeholder-shown):invalid:focus {\n    box-shadow: 0 0 0 0.1rem rgba(232, 86, 0, 0.2); }\n  .form-input:not(:placeholder-shown):invalid + .form-input-hint {\n    color: #e85600; }\n\n.form-input:disabled, .form-input.disabled,\n.form-select:disabled,\n.form-select.disabled {\n  background-color: #f0f1f4;\n  cursor: not-allowed;\n  opacity: .5; }\n\n.form-input[readonly] {\n  background-color: #f8f9fa; }\n\ninput:disabled + .form-icon, input.disabled + .form-icon {\n  background: #f0f1f4;\n  cursor: not-allowed;\n  opacity: .5; }\n\n.form-switch input:disabled + .form-icon::before, .form-switch input.disabled + .form-icon::before {\n  background: #fff; }\n\n.form-horizontal {\n  padding: 0.4rem 0; }\n  .form-horizontal .form-group {\n    display: flex;\n    flex-wrap: wrap; }\n\n/*! Spectre.css Icons v0.5.1 | MIT License | github.com/picturepan2/spectre */\n.icon {\n  box-sizing: border-box;\n  display: inline-block;\n  font-size: inherit;\n  font-style: normal;\n  height: 1em;\n  position: relative;\n  text-indent: -9999px;\n  vertical-align: middle;\n  width: 1em; }\n  .icon::before, .icon::after {\n    display: block;\n    left: 50%;\n    position: absolute;\n    top: 50%;\n    transform: translate(-50%, -50%); }\n  .icon.icon-2x {\n    font-size: 1.6rem; }\n  .icon.icon-3x {\n    font-size: 2.4rem; }\n  .icon.icon-4x {\n    font-size: 3.2rem; }\n\n.accordion .icon,\n.btn .icon,\n.toast .icon,\n.menu .icon {\n  vertical-align: -10%; }\n\n.btn-lg .icon {\n  vertical-align: -15%; }\n\n.icon-arrow-down::before,\n.icon-arrow-left::before,\n.icon-arrow-right::before,\n.icon-arrow-up::before,\n.icon-downward::before,\n.icon-back::before,\n.icon-forward::before,\n.icon-upward::before {\n  border: 0.1rem solid currentColor;\n  border-bottom: 0;\n  border-right: 0;\n  content: \"\";\n  height: .65em;\n  width: .65em; }\n\n.icon-arrow-down::before {\n  transform: translate(-50%, -75%) rotate(225deg); }\n\n.icon-arrow-left::before {\n  transform: translate(-25%, -50%) rotate(-45deg); }\n\n.icon-arrow-right::before {\n  transform: translate(-75%, -50%) rotate(135deg); }\n\n.icon-arrow-up::before {\n  transform: translate(-50%, -25%) rotate(45deg); }\n\n.icon-back::after,\n.icon-forward::after {\n  background: currentColor;\n  content: \"\";\n  height: 0.1rem;\n  width: .8em; }\n\n.icon-downward::after,\n.icon-upward::after {\n  background: currentColor;\n  content: \"\";\n  height: .8em;\n  width: 0.1rem; }\n\n.icon-back::after {\n  left: 55%; }\n\n.icon-back::before {\n  transform: translate(-50%, -50%) rotate(-45deg); }\n\n.icon-downward::after {\n  top: 45%; }\n\n.icon-downward::before {\n  transform: translate(-50%, -50%) rotate(-135deg); }\n\n.icon-forward::after {\n  left: 45%; }\n\n.icon-forward::before {\n  transform: translate(-50%, -50%) rotate(135deg); }\n\n.icon-upward::after {\n  top: 55%; }\n\n.icon-upward::before {\n  transform: translate(-50%, -50%) rotate(45deg); }\n\n.icon-caret::before {\n  border-top: .3em solid currentColor;\n  border-right: .3em solid transparent;\n  border-left: .3em solid transparent;\n  content: \"\";\n  height: 0;\n  transform: translate(-50%, -25%);\n  width: 0; }\n\n.icon-menu::before {\n  background: currentColor;\n  box-shadow: 0 -.35em, 0 .35em;\n  content: \"\";\n  height: 0.1rem;\n  width: 100%; }\n\n.icon-apps::before {\n  background: currentColor;\n  box-shadow: -.35em -.35em, -.35em 0, -.35em .35em, 0 -.35em, 0 .35em, .35em -.35em, .35em 0, .35em .35em;\n  content: \"\";\n  height: 3px;\n  width: 3px; }\n\n.icon-resize-horiz::before, .icon-resize-horiz::after,\n.icon-resize-vert::before,\n.icon-resize-vert::after {\n  border: 0.1rem solid currentColor;\n  border-bottom: 0;\n  border-right: 0;\n  content: \"\";\n  height: .45em;\n  width: .45em; }\n\n.icon-resize-horiz::before,\n.icon-resize-vert::before {\n  transform: translate(-50%, -90%) rotate(45deg); }\n\n.icon-resize-horiz::after,\n.icon-resize-vert::after {\n  transform: translate(-50%, -10%) rotate(225deg); }\n\n.icon-resize-horiz::before {\n  transform: translate(-90%, -50%) rotate(-45deg); }\n\n.icon-resize-horiz::after {\n  transform: translate(-10%, -50%) rotate(135deg); }\n\n.icon-more-horiz::before,\n.icon-more-vert::before {\n  background: currentColor;\n  box-shadow: -.4em 0, .4em 0;\n  border-radius: 50%;\n  content: \"\";\n  height: 3px;\n  width: 3px; }\n\n.icon-more-vert::before {\n  box-shadow: 0 -.4em, 0 .4em; }\n\n.icon-plus::before,\n.icon-minus::before,\n.icon-cross::before {\n  background: currentColor;\n  content: \"\";\n  height: 0.1rem;\n  width: 100%; }\n\n.icon-plus::after,\n.icon-cross::after {\n  background: currentColor;\n  content: \"\";\n  height: 100%;\n  width: 0.1rem; }\n\n.icon-cross::before {\n  width: 100%; }\n\n.icon-cross::after {\n  height: 100%; }\n\n.icon-cross::before, .icon-cross::after {\n  transform: translate(-50%, -50%) rotate(45deg); }\n\n.icon-check::before {\n  border: 0.1rem solid currentColor;\n  border-right: 0;\n  border-top: 0;\n  content: \"\";\n  height: .5em;\n  width: .9em;\n  transform: translate(-50%, -75%) rotate(-45deg); }\n\n.icon-stop {\n  border: 0.1rem solid currentColor;\n  border-radius: 50%; }\n  .icon-stop::before {\n    background: currentColor;\n    content: \"\";\n    height: 0.1rem;\n    transform: translate(-50%, -50%) rotate(45deg);\n    width: 1em; }\n\n.icon-shutdown {\n  border: 0.1rem solid currentColor;\n  border-radius: 50%;\n  border-top-color: transparent; }\n  .icon-shutdown::before {\n    background: currentColor;\n    content: \"\";\n    height: .5em;\n    top: .1em;\n    width: 0.1rem; }\n\n.icon-refresh::before {\n  border: 0.1rem solid currentColor;\n  border-radius: 50%;\n  border-right-color: transparent;\n  content: \"\";\n  height: 1em;\n  width: 1em; }\n\n.icon-refresh::after {\n  border: .2em solid currentColor;\n  border-top-color: transparent;\n  border-left-color: transparent;\n  content: \"\";\n  height: 0;\n  left: 80%;\n  top: 20%;\n  width: 0; }\n\n.icon-search::before {\n  border: 0.1rem solid currentColor;\n  border-radius: 50%;\n  content: \"\";\n  height: .75em;\n  left: 5%;\n  top: 5%;\n  transform: translate(0, 0) rotate(45deg);\n  width: .75em; }\n\n.icon-search::after {\n  background: currentColor;\n  content: \"\";\n  height: 0.1rem;\n  left: 80%;\n  top: 80%;\n  transform: translate(-50%, -50%) rotate(45deg);\n  width: .4em; }\n\n.icon-edit::before {\n  border: 0.1rem solid currentColor;\n  content: \"\";\n  height: .4em;\n  transform: translate(-40%, -60%) rotate(-45deg);\n  width: .85em; }\n\n.icon-edit::after {\n  border: .15em solid currentColor;\n  border-top-color: transparent;\n  border-right-color: transparent;\n  content: \"\";\n  height: 0;\n  left: 5%;\n  top: 95%;\n  transform: translate(0, -100%);\n  width: 0; }\n\n.icon-delete::before {\n  border: 0.1rem solid currentColor;\n  border-bottom-left-radius: 0.1rem;\n  border-bottom-right-radius: 0.1rem;\n  border-top: 0;\n  content: \"\";\n  height: .75em;\n  top: 60%;\n  width: .75em; }\n\n.icon-delete::after {\n  background: currentColor;\n  box-shadow: -.25em .2em, .25em .2em;\n  content: \"\";\n  height: 0.1rem;\n  top: 0.05rem;\n  width: .5em; }\n\n.icon-share {\n  border: 0.1rem solid currentColor;\n  border-radius: 0.1rem;\n  border-right: 0;\n  border-top: 0; }\n  .icon-share::before {\n    border: 0.1rem solid currentColor;\n    border-left: 0;\n    border-top: 0;\n    content: \"\";\n    height: .4em;\n    left: 100%;\n    top: .25em;\n    transform: translate(-125%, -50%) rotate(-45deg);\n    width: .4em; }\n  .icon-share::after {\n    border: 0.1rem solid currentColor;\n    border-bottom: 0;\n    border-right: 0;\n    border-radius: 75% 0;\n    content: \"\";\n    height: .5em;\n    width: .6em; }\n\n.icon-flag::before {\n  background: currentColor;\n  content: \"\";\n  height: 1em;\n  left: 15%;\n  width: 0.1rem; }\n\n.icon-flag::after {\n  border: 0.1rem solid currentColor;\n  border-bottom-right-radius: 0.1rem;\n  border-left: 0;\n  border-top-right-radius: 0.1rem;\n  content: \"\";\n  height: .65em;\n  top: 35%;\n  left: 60%;\n  width: .8em; }\n\n.icon-bookmark::before {\n  border: 0.1rem solid currentColor;\n  border-bottom: 0;\n  border-top-left-radius: 0.1rem;\n  border-top-right-radius: 0.1rem;\n  content: \"\";\n  height: .9em;\n  width: .8em; }\n\n.icon-bookmark::after {\n  border: 0.1rem solid currentColor;\n  border-bottom: 0;\n  border-left: 0;\n  border-radius: 0.1rem;\n  content: \"\";\n  height: .5em;\n  transform: translate(-50%, 35%) rotate(-45deg) skew(15deg, 15deg);\n  width: .5em; }\n\n.icon-download,\n.icon-upload {\n  border-bottom: 0.1rem solid currentColor; }\n  .icon-download::before,\n  .icon-upload::before {\n    border: 0.1rem solid currentColor;\n    border-bottom: 0;\n    border-right: 0;\n    content: \"\";\n    height: .5em;\n    width: .5em;\n    transform: translate(-50%, -60%) rotate(-135deg); }\n  .icon-download::after,\n  .icon-upload::after {\n    background: currentColor;\n    content: \"\";\n    height: .6em;\n    top: 40%;\n    width: 0.1rem; }\n\n.icon-upload::before {\n  transform: translate(-50%, -60%) rotate(45deg); }\n\n.icon-upload::after {\n  top: 50%; }\n\n.icon-time {\n  border: 0.1rem solid currentColor;\n  border-radius: 50%; }\n  .icon-time::before {\n    background: currentColor;\n    content: \"\";\n    height: .4em;\n    transform: translate(-50%, -75%);\n    width: 0.1rem; }\n  .icon-time::after {\n    background: currentColor;\n    content: \"\";\n    height: .3em;\n    transform: translate(-50%, -75%) rotate(90deg);\n    transform-origin: 50% 90%;\n    width: 0.1rem; }\n\n.icon-mail::before {\n  border: 0.1rem solid currentColor;\n  border-radius: 0.1rem;\n  content: \"\";\n  height: .8em;\n  width: 1em; }\n\n.icon-mail::after {\n  border: 0.1rem solid currentColor;\n  border-right: 0;\n  border-top: 0;\n  content: \"\";\n  height: .5em;\n  transform: translate(-50%, -90%) rotate(-45deg) skew(10deg, 10deg);\n  width: .5em; }\n\n.icon-people::before {\n  border: 0.1rem solid currentColor;\n  border-radius: 50%;\n  content: \"\";\n  height: .45em;\n  top: 25%;\n  width: .45em; }\n\n.icon-people::after {\n  border: 0.1rem solid currentColor;\n  border-radius: 50% 50% 0 0;\n  content: \"\";\n  height: .4em;\n  top: 75%;\n  width: .9em; }\n\n.icon-message {\n  border: 0.1rem solid currentColor;\n  border-bottom: 0;\n  border-radius: 0.1rem;\n  border-right: 0; }\n  .icon-message::before {\n    border: 0.1rem solid currentColor;\n    border-bottom-right-radius: 0.1rem;\n    border-left: 0;\n    border-top: 0;\n    content: \"\";\n    height: .8em;\n    left: 65%;\n    top: 40%;\n    width: .7em; }\n  .icon-message::after {\n    background: currentColor;\n    border-radius: 0.1rem;\n    content: \"\";\n    height: .3em;\n    left: 10%;\n    top: 100%;\n    transform: translate(0, -90%) rotate(45deg);\n    width: 0.1rem; }\n\n.icon-photo {\n  border: 0.1rem solid currentColor;\n  border-radius: 0.1rem; }\n  .icon-photo::before {\n    border: 0.1rem solid currentColor;\n    border-radius: 50%;\n    content: \"\";\n    height: .25em;\n    left: 35%;\n    top: 35%;\n    width: .25em; }\n  .icon-photo::after {\n    border: 0.1rem solid currentColor;\n    border-bottom: 0;\n    border-left: 0;\n    content: \"\";\n    height: .5em;\n    left: 60%;\n    transform: translate(-50%, 25%) rotate(-45deg);\n    width: .5em; }\n\n.icon-link::before, .icon-link::after {\n  border: 0.1rem solid currentColor;\n  border-radius: 5em 0 0 5em;\n  border-right: 0;\n  content: \"\";\n  height: .5em;\n  width: .75em; }\n\n.icon-link::before {\n  transform: translate(-70%, -45%) rotate(-45deg); }\n\n.icon-link::after {\n  transform: translate(-30%, -55%) rotate(135deg); }\n\n.icon-location::before {\n  border: 0.1rem solid currentColor;\n  border-radius: 50% 50% 50% 0;\n  content: \"\";\n  height: .8em;\n  transform: translate(-50%, -60%) rotate(-45deg);\n  width: .8em; }\n\n.icon-location::after {\n  border: 0.1rem solid currentColor;\n  border-radius: 50%;\n  content: \"\";\n  height: .2em;\n  transform: translate(-50%, -80%);\n  width: .2em; }\n\n.icon-emoji {\n  border: 0.1rem solid currentColor;\n  border-radius: 50%; }\n  .icon-emoji::before {\n    border-radius: 50%;\n    box-shadow: -.17em -.15em, .17em -.15em;\n    content: \"\";\n    height: .1em;\n    width: .1em; }\n  .icon-emoji::after {\n    border: 0.1rem solid currentColor;\n    border-bottom-color: transparent;\n    border-radius: 50%;\n    border-right-color: transparent;\n    content: \"\";\n    height: .5em;\n    transform: translate(-50%, -40%) rotate(-135deg);\n    width: .5em; }\n\nspan.icon-caret-right::before {\n  border-top: 0.3em solid currentColor;\n  border-right: 0.3em solid transparent;\n  border-left: 0.3em solid transparent;\n  content: \"\";\n  height: 0;\n  transform: translate(-50%, -50%) rotate(-90deg);\n  width: 0; }\n\n.scrollable {\n  display: flex;\n  overflow: auto; }\n  .scrollable .scrollable-content {\n    display: flex;\n    min-height: 0px;\n    min-width: 0px;\n    flex-grow: 1; }\n";
styleInject(css);

var css$2 = ".debugger-options {\n  display: flex;\n  flex-shrink: 0; }\n  .debugger-options select {\n    -webkit-appearance: none; }\n  .debugger-options .option {\n    flex-grow: 1;\n    padding-left: 0.5rem;\n    padding-right: 0.5rem; }\n";
styleInject(css$2);

function DebuggerOptions(props) {
    var state = props.state, actions = props.actions;
    return (h("div", { class: "debugger-options" },
        h("div", { class: "form-group option" },
            h("label", { class: "form-checkbox" },
                h("input", { type: "checkbox", checked: state.collapseRepeatingActions, onchange: actions.toggleCollapseRepeatingActions }),
                h("i", { class: "form-icon" }),
                " Group repeating actions")),
        h("div", { class: "form-group option" },
            h("select", { class: "form-select", onchange: function (e) { return actions.setValueDisplay(e.target.value); }, value: state.valueDisplay },
                h("option", { value: "state" }, "Show Full State"),
                h("option", { value: "result" }, "Show Action Result"),
                h("option", { value: "data" }, "Show Action Data"),
                h("option", { value: "debugger-state" }, "Show Debugger Own State")))));
}
//# sourceMappingURL=DebuggerOptions.js.map

var css$4 = ".debug-pane-toolbar {\n  display: flex;\n  justify-content: space-between;\n  flex-shrink: 0;\n  width: 100%;\n  border-bottom: 1px solid black; }\n  .debug-pane-toolbar .toolbar-section {\n    align-items: center;\n    display: flex;\n    flex: 1 0 0; }\n    .debug-pane-toolbar .toolbar-section:not(:first-child):last-child {\n      justify-content: flex-end; }\n  .debug-pane-toolbar .view-buttons {\n    margin: 0.1rem; }\n  .debug-pane-toolbar .travel-button {\n    margin: 0.1rem;\n    align-items: center;\n    display: flex;\n    flex: 0 0 auto; }\n  .debug-pane-toolbar .close-button {\n    margin: 0.1rem 0.3rem; }\n";
styleInject(css$4);

function DebugPaneToolbar(props) {
    var state = props.state, actions = props.actions, runs = props.runs;
    return (h("div", { class: "debug-pane-toolbar" },
        h("span", { class: "toolbar-section view-buttons" },
            h("button", { class: "btn btn-sm", onclick: function () { return actions.setPaneDisplay("fullscreen"); } }, "Full Screen"),
            h("button", { class: "btn btn-sm", onclick: function () { return actions.setPaneDisplay("right"); } }, "Right"),
            h("button", { class: "btn btn-sm", onclick: function () { return actions.setPaneDisplay("bottom"); } }, "Bottom")),
        h("span", { class: "toolbar-section travel-button" },
            h("button", { class: "btn btn-sm btn-primary", onclick: function () { return actions.timeTravel(state.selectedAction); }, disabled: !canTravelToSelectedAction(state, runs) }, "Travel to Action")),
        h("span", { class: "toolbar-section close-button" },
            h("button", { class: "btn btn-clear", onclick: function () { return actions.showPane(false); } }))));
}
//# sourceMappingURL=DebugPaneToolbar.js.map

var css$6 = ".debug-pane-content {\n  display: flex;\n  flex-direction: row;\n  flex-grow: 1; }\n";
styleInject(css$6);

var css$8 = ".object-details-pane {\n  flex: 0 0 60%;\n  border: 1px solid #666666;\n  margin: 0.1rem; }\n  .object-details-pane pre {\n    margin: 0rem; }\n";
styleInject(css$8);

var css$10 = "@charset \"UTF-8\";\n._object-view {\n  display: flex;\n  min-height: 0px;\n  min-width: 0px;\n  flex-grow: 1;\n  color: #c0c5ce;\n  font-family: \"Roboto Mono\", monospace;\n  font-size: 12px;\n  line-height: 1.25em;\n  white-space: nowrap;\n  background: #2b303b; }\n  ._object-view .-row {\n    padding: 0 0 0 2ch; }\n    ._object-view .-row:not(:last-of-type)::after {\n      content: \",\"; }\n  ._object-view .-key {\n    color: #bf616a; }\n    ._object-view .-key::after {\n      color: #c0c5ce;\n      content: \": \"; }\n  ._object-view .-null::before {\n    color: #d08770;\n    content: \"null\"; }\n  ._object-view .-array::after {\n    content: \"]\"; }\n  ._object-view .-array::before {\n    content: \"[\"; }\n  ._object-view .-boolean {\n    color: #96b5b4; }\n  ._object-view .-function::before {\n    content: \"ƒ\"; }\n  ._object-view .-number {\n    color: #ebcb8b; }\n  ._object-view .-object::after {\n    content: \"}\"; }\n  ._object-view .-object::before {\n    content: \"{\"; }\n  ._object-view .-string {\n    color: #a3be8c; }\n    ._object-view .-string::after {\n      content: \"'\"; }\n    ._object-view .-string::before {\n      content: \"'\"; }\n  ._object-view .-undefined::before {\n    color: #d08770;\n    content: \"undefined\"; }\n  ._object-view .-expand::before {\n    content: \"+\"; }\n  ._object-view .-collapse::before {\n    content: \"-\"; }\n";
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

var css$12 = ".runs-pane {\n  flex: 0 0 40%;\n  border: 1px solid #666666;\n  margin: 0.1rem;\n  align-items: stretch; }\n  .runs-pane .runs-pane-runs {\n    margin: 0.2rem 0rem 0.4rem 0.2rem; }\n";
styleInject(css$12);

var css$14 = ".run-pane-item {\n  list-style-type: none;\n  width: 100%; }\n";
styleInject(css$14);

var css$16 = ".run-action-item-list {\n  list-style-type: none;\n  margin: 0.3rem 0 0 0.3rem; }\n";
styleInject(css$16);

var css$18 = "/* Manually forked from Normalize.css */\n/* normalize.css v5.0.0 | MIT License | github.com/necolas/normalize.css */\n/**\n * 1. Change the default font family in all browsers (opinionated).\n * 2. Correct the line height in all browsers.\n * 3. Prevent adjustments of font size after orientation changes in\n *    IE on Windows Phone and in iOS.\n */\n/* Document\n   ========================================================================== */\nhtml {\n  font-family: sans-serif;\n  /* 1 */\n  -ms-text-size-adjust: 100%;\n  /* 3 */\n  -webkit-text-size-adjust: 100%;\n  /* 3 */ }\n\n/* Sections\n   ========================================================================== */\n/**\n * Remove the margin in all browsers (opinionated).\n */\nbody {\n  margin: 0; }\n\n/**\n * Add the correct display in IE 9-.\n */\narticle,\naside,\nfooter,\nheader,\nnav,\nsection {\n  display: block; }\n\n/**\n * Correct the font size and margin on `h1` elements within `section` and\n * `article` contexts in Chrome, Firefox, and Safari.\n */\nh1 {\n  font-size: 2em;\n  margin: 0.67em 0; }\n\n/* Grouping content\n   ========================================================================== */\n/**\n * Add the correct display in IE 9-.\n * 1. Add the correct display in IE.\n */\nfigcaption,\nfigure,\nmain {\n  /* 1 */\n  display: block; }\n\n/**\n * Add the correct margin in IE 8 (removed).\n */\n/**\n * 1. Add the correct box sizing in Firefox.\n * 2. Show the overflow in Edge and IE.\n */\nhr {\n  box-sizing: content-box;\n  /* 1 */\n  height: 0;\n  /* 1 */\n  overflow: visible;\n  /* 2 */ }\n\n/**\n * 1. Correct the inheritance and scaling of font size in all browsers. (removed)\n * 2. Correct the odd `em` font sizing in all browsers.\n */\n/* Text-level semantics\n   ========================================================================== */\n/**\n * 1. Remove the gray background on active links in IE 10.\n * 2. Remove gaps in links underline in iOS 8+ and Safari 8+.\n */\na {\n  background-color: transparent;\n  /* 1 */\n  -webkit-text-decoration-skip: objects;\n  /* 2 */ }\n\n/**\n * Remove the outline on focused links when they are also active or hovered\n * in all browsers (opinionated).\n */\na:active,\na:hover {\n  outline-width: 0; }\n\n/**\n * Modify default styling of address.\n */\naddress {\n  font-style: normal; }\n\n/**\n * 1. Remove the bottom border in Firefox 39-.\n * 2. Add the correct text decoration in Chrome, Edge, IE, Opera, and Safari. (removed)\n */\n/**\n * Prevent the duplicate application of `bolder` by the next rule in Safari 6.\n */\nb,\nstrong {\n  font-weight: inherit; }\n\n/**\n * Add the correct font weight in Chrome, Edge, and Safari.\n */\nb,\nstrong {\n  font-weight: bolder; }\n\n/**\n * 1. Correct the inheritance and scaling of font size in all browsers.\n * 2. Correct the odd `em` font sizing in all browsers.\n */\ncode,\nkbd,\npre,\nsamp {\n  font-family: \"SF Mono\", \"Segoe UI Mono\", \"Roboto Mono\", Menlo, Courier, monospace;\n  /* 1 (changed) */\n  font-size: 1em;\n  /* 2 */ }\n\n/**\n * Add the correct font style in Android 4.3-.\n */\ndfn {\n  font-style: italic; }\n\n/**\n * Add the correct background and color in IE 9-. (Removed)\n */\n/**\n * Add the correct font size in all browsers.\n */\nsmall {\n  font-size: 80%;\n  font-weight: 400;\n  /* (added) */ }\n\n/**\n * Prevent `sub` and `sup` elements from affecting the line height in\n * all browsers.\n */\nsub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline; }\n\nsub {\n  bottom: -0.25em; }\n\nsup {\n  top: -0.5em; }\n\n/* Embedded content\n   ========================================================================== */\n/**\n * Add the correct display in IE 9-.\n */\naudio,\nvideo {\n  display: inline-block; }\n\n/**\n * Add the correct display in iOS 4-7.\n */\naudio:not([controls]) {\n  display: none;\n  height: 0; }\n\n/**\n * Remove the border on images inside links in IE 10-.\n */\nimg {\n  border-style: none; }\n\n/**\n * Hide the overflow in IE.\n */\nsvg:not(:root) {\n  overflow: hidden; }\n\n/* Forms\n   ========================================================================== */\n/**\n * 1. Change the font styles in all browsers (opinionated).\n * 2. Remove the margin in Firefox and Safari.\n */\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  font-family: inherit;\n  /* 1 (changed) */\n  font-size: inherit;\n  /* 1 (changed) */\n  line-height: inherit;\n  /* 1 (changed) */\n  margin: 0;\n  /* 2 */ }\n\n/**\n * Show the overflow in IE.\n * 1. Show the overflow in Edge.\n */\nbutton,\ninput {\n  /* 1 */\n  overflow: visible; }\n\n/**\n * Remove the inheritance of text transform in Edge, Firefox, and IE.\n * 1. Remove the inheritance of text transform in Firefox.\n */\nbutton,\nselect {\n  /* 1 */\n  text-transform: none; }\n\n/**\n * 1. Prevent a WebKit bug where (2) destroys native `audio` and `video`\n *    controls in Android 4.\n * 2. Correct the inability to style clickable types in iOS and Safari.\n */\nbutton,\nhtml [type=\"button\"],\n[type=\"reset\"],\n[type=\"submit\"] {\n  -webkit-appearance: button;\n  /* 2 */ }\n\n/**\n * Remove the inner border and padding in Firefox.\n */\nbutton::-moz-focus-inner,\n[type=\"button\"]::-moz-focus-inner,\n[type=\"reset\"]::-moz-focus-inner,\n[type=\"submit\"]::-moz-focus-inner {\n  border-style: none;\n  padding: 0; }\n\n/**\n * Restore the focus styles unset by the previous rule (removed).\n */\n/**\n * Change the border, margin, and padding in all browsers (opinionated) (changed).\n */\nfieldset {\n  border: 0;\n  margin: 0;\n  padding: 0; }\n\n/**\n * 1. Correct the text wrapping in Edge and IE.\n * 2. Correct the color inheritance from `fieldset` elements in IE.\n * 3. Remove the padding so developers are not caught out when they zero out\n *    `fieldset` elements in all browsers.\n */\nlegend {\n  box-sizing: border-box;\n  /* 1 */\n  color: inherit;\n  /* 2 */\n  display: table;\n  /* 1 */\n  max-width: 100%;\n  /* 1 */\n  padding: 0;\n  /* 3 */\n  white-space: normal;\n  /* 1 */ }\n\n/**\n * 1. Add the correct display in IE 9-.\n * 2. Add the correct vertical alignment in Chrome, Firefox, and Opera.\n */\nprogress {\n  display: inline-block;\n  /* 1 */\n  vertical-align: baseline;\n  /* 2 */ }\n\n/**\n * Remove the default vertical scrollbar in IE.\n */\ntextarea {\n  overflow: auto; }\n\n/**\n * 1. Add the correct box sizing in IE 10-.\n * 2. Remove the padding in IE 10-.\n */\n[type=\"checkbox\"],\n[type=\"radio\"] {\n  box-sizing: border-box;\n  /* 1 */\n  padding: 0;\n  /* 2 */ }\n\n/**\n * Correct the cursor style of increment and decrement buttons in Chrome.\n */\n[type=\"number\"]::-webkit-inner-spin-button,\n[type=\"number\"]::-webkit-outer-spin-button {\n  height: auto; }\n\n/**\n * 1. Correct the odd appearance in Chrome and Safari.\n * 2. Correct the outline style in Safari.\n */\n[type=\"search\"] {\n  -webkit-appearance: textfield;\n  /* 1 */\n  outline-offset: -2px;\n  /* 2 */ }\n\n/**\n * Remove the inner padding and cancel buttons in Chrome and Safari on macOS.\n */\n[type=\"search\"]::-webkit-search-cancel-button,\n[type=\"search\"]::-webkit-search-decoration {\n  -webkit-appearance: none; }\n\n/**\n * 1. Correct the inability to style clickable types in iOS and Safari.\n * 2. Change font properties to `inherit` in Safari.\n */\n::-webkit-file-upload-button {\n  -webkit-appearance: button;\n  /* 1 */\n  font: inherit;\n  /* 2 */ }\n\n/* Interactive\n   ========================================================================== */\n/*\n * Add the correct display in IE 9-.\n * 1. Add the correct display in Edge, IE, and Firefox.\n */\ndetails,\nmenu {\n  display: block; }\n\n/*\n * Add the correct display in all browsers.\n */\nsummary {\n  display: list-item;\n  outline: none; }\n\n/* Scripting\n   ========================================================================== */\n/**\n * Add the correct display in IE 9-.\n */\ncanvas {\n  display: inline-block; }\n\n/**\n * Add the correct display in IE.\n */\ntemplate {\n  display: none; }\n\n/* Hidden\n   ========================================================================== */\n/**\n * Add the correct display in IE 10-.\n */\n[hidden] {\n  display: none; }\n\n*,\n*::before,\n*::after {\n  box-sizing: inherit; }\n\nhtml {\n  box-sizing: border-box;\n  font-size: 20px;\n  line-height: 1.5;\n  -webkit-tap-highlight-color: transparent; }\n\nbody {\n  background: #fff;\n  color: #50596c;\n  font-family: -apple-system, system-ui, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", sans-serif;\n  font-size: 0.8rem;\n  overflow-x: hidden;\n  text-rendering: optimizeLegibility; }\n\na {\n  color: #5755d9;\n  outline: none;\n  text-decoration: none; }\n  a:focus {\n    box-shadow: 0 0 0 0.1rem rgba(87, 85, 217, 0.2); }\n  a:focus, a:hover, a:active, a.active {\n    color: #4240d4;\n    text-decoration: underline; }\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  color: inherit;\n  font-weight: 500;\n  line-height: 1.2;\n  margin-bottom: .5em;\n  margin-top: 0; }\n\n.h1,\n.h2,\n.h3,\n.h4,\n.h5,\n.h6 {\n  font-weight: 500; }\n\nh1,\n.h1 {\n  font-size: 2rem; }\n\nh2,\n.h2 {\n  font-size: 1.6rem; }\n\nh3,\n.h3 {\n  font-size: 1.4rem; }\n\nh4,\n.h4 {\n  font-size: 1.2rem; }\n\nh5,\n.h5 {\n  font-size: 1rem; }\n\nh6,\n.h6 {\n  font-size: .8rem; }\n\np {\n  margin: 0 0 1rem; }\n\na,\nins,\nu {\n  text-decoration-skip: ink edges; }\n\nabbr[title] {\n  border-bottom: 0.05rem dotted;\n  cursor: help;\n  text-decoration: none; }\n\nkbd {\n  border-radius: 0.1rem;\n  line-height: 1.2;\n  padding: .1rem .15rem;\n  background: #454d5d;\n  color: #fff;\n  font-size: 0.7rem; }\n\nmark {\n  background: #ffe9b3;\n  color: #50596c;\n  border-radius: 0.1rem;\n  padding: .05rem; }\n\nblockquote {\n  border-left: 0.1rem solid #e7e9ed;\n  margin-left: 0;\n  padding: 0.4rem 0.8rem; }\n  blockquote p:last-child {\n    margin-bottom: 0; }\n\nul,\nol {\n  margin: 0.8rem 0 0.8rem 0.8rem;\n  padding: 0; }\n  ul ul,\n  ul ol,\n  ol ul,\n  ol ol {\n    margin: 0.8rem 0 0.8rem 0.8rem; }\n  ul li,\n  ol li {\n    margin-top: 0.4rem; }\n\nul {\n  list-style: disc inside; }\n  ul ul {\n    list-style-type: circle; }\n\nol {\n  list-style: decimal inside; }\n  ol ol {\n    list-style-type: lower-alpha; }\n\ndl dt {\n  font-weight: bold; }\n\ndl dd {\n  margin: 0.4rem 0 0.8rem 0; }\n\n.btn {\n  transition: all .2s ease;\n  appearance: none;\n  background: #fff;\n  border: 0.05rem solid #5755d9;\n  border-radius: 0.1rem;\n  color: #5755d9;\n  cursor: pointer;\n  display: inline-block;\n  font-size: 0.8rem;\n  height: 1.8rem;\n  line-height: 1rem;\n  outline: none;\n  padding: 0.35rem 0.4rem;\n  text-align: center;\n  text-decoration: none;\n  user-select: none;\n  vertical-align: middle;\n  white-space: nowrap; }\n  .btn:focus {\n    box-shadow: 0 0 0 0.1rem rgba(87, 85, 217, 0.2); }\n  .btn:focus, .btn:hover {\n    background: #f1f1fc;\n    border-color: #4b48d6;\n    text-decoration: none; }\n  .btn:active, .btn.active {\n    background: #4b48d6;\n    border-color: #3634d2;\n    color: #fff;\n    text-decoration: none; }\n    .btn:active.loading::after, .btn.active.loading::after {\n      border-bottom-color: #fff;\n      border-left-color: #fff; }\n  .btn[disabled], .btn:disabled, .btn.disabled {\n    cursor: default;\n    opacity: .5;\n    pointer-events: none; }\n  .btn.btn-primary {\n    background: #5755d9;\n    border-color: #4b48d6;\n    color: #fff; }\n    .btn.btn-primary:focus, .btn.btn-primary:hover {\n      background: #4240d4;\n      border-color: #3634d2;\n      color: #fff; }\n    .btn.btn-primary:active, .btn.btn-primary.active {\n      background: #3a38d2;\n      border-color: #302ecd;\n      color: #fff; }\n    .btn.btn-primary.loading::after {\n      border-bottom-color: #fff;\n      border-left-color: #fff; }\n  .btn.btn-success {\n    background: #32b643;\n    border-color: #2faa3f;\n    color: #fff; }\n    .btn.btn-success:focus {\n      box-shadow: 0 0 0 0.1rem rgba(50, 182, 67, 0.2); }\n    .btn.btn-success:focus, .btn.btn-success:hover {\n      background: #30ae40;\n      border-color: #2da23c;\n      color: #fff; }\n    .btn.btn-success:active, .btn.btn-success.active {\n      background: #2a9a39;\n      border-color: #278e34;\n      color: #fff; }\n    .btn.btn-success.loading::after {\n      border-bottom-color: #fff;\n      border-left-color: #fff; }\n  .btn.btn-error {\n    background: #e85600;\n    border-color: #d95000;\n    color: #fff; }\n    .btn.btn-error:focus {\n      box-shadow: 0 0 0 0.1rem rgba(232, 86, 0, 0.2); }\n    .btn.btn-error:focus, .btn.btn-error:hover {\n      background: #de5200;\n      border-color: #cf4d00;\n      color: #fff; }\n    .btn.btn-error:active, .btn.btn-error.active {\n      background: #c44900;\n      border-color: #b54300;\n      color: #fff; }\n    .btn.btn-error.loading::after {\n      border-bottom-color: #fff;\n      border-left-color: #fff; }\n  .btn.btn-link {\n    background: transparent;\n    border-color: transparent;\n    color: #5755d9; }\n    .btn.btn-link:focus, .btn.btn-link:hover, .btn.btn-link:active, .btn.btn-link.active {\n      color: #4240d4; }\n  .btn.btn-sm {\n    font-size: 0.7rem;\n    height: 1.4rem;\n    padding: 0.15rem 0.3rem; }\n  .btn.btn-lg {\n    font-size: 0.9rem;\n    height: 2rem;\n    padding: 0.45rem 0.6rem; }\n  .btn.btn-block {\n    display: block;\n    width: 100%; }\n  .btn.btn-action {\n    width: 1.8rem;\n    padding-left: 0;\n    padding-right: 0; }\n    .btn.btn-action.btn-sm {\n      width: 1.4rem; }\n    .btn.btn-action.btn-lg {\n      width: 2rem; }\n  .btn.btn-clear {\n    background: transparent;\n    border: 0;\n    color: currentColor;\n    height: 0.8rem;\n    line-height: 0.8rem;\n    margin-left: 0.2rem;\n    margin-right: -2px;\n    opacity: 1;\n    padding: 0;\n    text-decoration: none;\n    width: 0.8rem; }\n    .btn.btn-clear:hover {\n      opacity: .95; }\n    .btn.btn-clear::before {\n      content: \"\\2715\"; }\n\n.btn-group {\n  display: inline-flex;\n  flex-wrap: wrap; }\n  .btn-group .btn {\n    flex: 1 0 auto; }\n    .btn-group .btn:first-child:not(:last-child) {\n      border-bottom-right-radius: 0;\n      border-top-right-radius: 0; }\n    .btn-group .btn:not(:first-child):not(:last-child) {\n      border-radius: 0;\n      margin-left: -0.05rem; }\n    .btn-group .btn:last-child:not(:first-child) {\n      border-bottom-left-radius: 0;\n      border-top-left-radius: 0;\n      margin-left: -0.05rem; }\n    .btn-group .btn:focus, .btn-group .btn:hover, .btn-group .btn:active, .btn-group .btn.active {\n      z-index: 1; }\n  .btn-group.btn-group-block {\n    display: flex; }\n    .btn-group.btn-group-block .btn {\n      flex: 1 0 0; }\n\n.form-group:not(:last-child) {\n  margin-bottom: 0.4rem; }\n\nfieldset {\n  margin-bottom: 0.8rem; }\n\nlegend {\n  font-size: 0.9rem;\n  font-weight: 500;\n  margin-bottom: 0.8rem; }\n\n.form-label {\n  display: block;\n  line-height: 1rem;\n  padding: 0.4rem 0; }\n  .form-label.label-sm {\n    font-size: 0.7rem;\n    padding: 0.2rem 0; }\n  .form-label.label-lg {\n    font-size: 0.9rem;\n    padding: 0.5rem 0; }\n\n.form-input {\n  transition: all .2s ease;\n  appearance: none;\n  background: #fff;\n  background-image: none;\n  border: 0.05rem solid #caced7;\n  border-radius: 0.1rem;\n  color: #50596c;\n  display: block;\n  font-size: 0.8rem;\n  height: 1.8rem;\n  line-height: 1rem;\n  max-width: 100%;\n  outline: none;\n  padding: 0.35rem 0.4rem;\n  position: relative;\n  width: 100%; }\n  .form-input:focus {\n    box-shadow: 0 0 0 0.1rem rgba(87, 85, 217, 0.2);\n    border-color: #5755d9; }\n  .form-input::placeholder {\n    color: #acb3c2; }\n  .form-input.input-sm {\n    font-size: 0.7rem;\n    height: 1.4rem;\n    padding: 0.15rem 0.3rem; }\n  .form-input.input-lg {\n    font-size: 0.9rem;\n    height: 2rem;\n    padding: 0.45rem 0.6rem; }\n  .form-input.input-inline {\n    display: inline-block;\n    vertical-align: middle;\n    width: auto; }\n  .form-input[type=\"file\"] {\n    height: auto; }\n\ntextarea.form-input {\n  height: auto; }\n\n.form-input-hint {\n  color: #acb3c2;\n  font-size: 0.7rem;\n  margin-top: 0.2rem; }\n  .has-success .form-input-hint,\n  .is-success + .form-input-hint {\n    color: #32b643; }\n  .has-error .form-input-hint,\n  .is-error + .form-input-hint {\n    color: #e85600; }\n\n.form-select {\n  appearance: none;\n  border: 0.05rem solid #caced7;\n  border-radius: 0.1rem;\n  color: inherit;\n  font-size: 0.8rem;\n  height: 1.8rem;\n  line-height: 1rem;\n  outline: none;\n  padding: 0.35rem 0.4rem;\n  vertical-align: middle;\n  width: 100%; }\n  .form-select[size], .form-select[multiple] {\n    height: auto; }\n    .form-select[size] option, .form-select[multiple] option {\n      padding: 0.1rem 0.2rem; }\n  .form-select:not([multiple]):not([size]) {\n    background: #fff url(\"data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%204%205'%3E%3Cpath%20fill='%23667189'%20d='M2%200L0%202h4zm0%205L0%203h4z'/%3E%3C/svg%3E\") no-repeat right 0.35rem center/0.4rem 0.5rem;\n    padding-right: 1.2rem; }\n  .form-select:focus {\n    box-shadow: 0 0 0 0.1rem rgba(87, 85, 217, 0.2);\n    border-color: #5755d9; }\n  .form-select::-ms-expand {\n    display: none; }\n  .form-select.select-sm {\n    font-size: 0.7rem;\n    height: 1.4rem;\n    padding: 0.15rem 1.1rem 0.15rem 0.3rem; }\n  .form-select.select-lg {\n    font-size: 0.9rem;\n    height: 2rem;\n    padding: 0.45rem 1.4rem 0.45rem 0.6rem; }\n\n.has-icon-left,\n.has-icon-right {\n  position: relative; }\n  .has-icon-left .form-icon,\n  .has-icon-right .form-icon {\n    height: 0.8rem;\n    margin: 0 0.35rem;\n    position: absolute;\n    top: 50%;\n    transform: translateY(-50%);\n    width: 0.8rem;\n    z-index: 2; }\n\n.has-icon-left .form-icon {\n  left: 0.05rem; }\n\n.has-icon-left .form-input {\n  padding-left: 1.5rem; }\n\n.has-icon-right .form-icon {\n  right: 0.05rem; }\n\n.has-icon-right .form-input {\n  padding-right: 1.5rem; }\n\n.form-checkbox,\n.form-radio,\n.form-switch {\n  display: inline-block;\n  line-height: 1rem;\n  margin: 0.2rem 0;\n  min-height: 1.2rem;\n  padding: 0.2rem 0.4rem 0.2rem 1.2rem;\n  position: relative; }\n  .form-checkbox input,\n  .form-radio input,\n  .form-switch input {\n    clip: rect(0, 0, 0, 0);\n    height: 1px;\n    margin: -1px;\n    overflow: hidden;\n    position: absolute;\n    width: 1px; }\n    .form-checkbox input:focus + .form-icon,\n    .form-radio input:focus + .form-icon,\n    .form-switch input:focus + .form-icon {\n      box-shadow: 0 0 0 0.1rem rgba(87, 85, 217, 0.2);\n      border-color: #5755d9; }\n    .form-checkbox input:checked + .form-icon,\n    .form-radio input:checked + .form-icon,\n    .form-switch input:checked + .form-icon {\n      background: #5755d9;\n      border-color: #5755d9; }\n  .form-checkbox .form-icon,\n  .form-radio .form-icon,\n  .form-switch .form-icon {\n    transition: all .2s ease;\n    border: 0.05rem solid #caced7;\n    cursor: pointer;\n    display: inline-block;\n    position: absolute; }\n  .form-checkbox.input-sm,\n  .form-radio.input-sm,\n  .form-switch.input-sm {\n    font-size: 0.7rem;\n    margin: 0; }\n  .form-checkbox.input-lg,\n  .form-radio.input-lg,\n  .form-switch.input-lg {\n    font-size: 0.9rem;\n    margin: 0.3rem 0; }\n\n.form-checkbox .form-icon,\n.form-radio .form-icon {\n  background: #fff;\n  height: 0.8rem;\n  left: 0;\n  top: 0.3rem;\n  width: 0.8rem; }\n\n.form-checkbox input:active + .form-icon,\n.form-radio input:active + .form-icon {\n  background: #f0f1f4; }\n\n.form-checkbox .form-icon {\n  border-radius: 0.1rem; }\n\n.form-checkbox input:checked + .form-icon::before {\n  background-clip: padding-box;\n  border: 0.1rem solid #fff;\n  border-left-width: 0;\n  border-top-width: 0;\n  content: \"\";\n  height: 12px;\n  left: 50%;\n  margin-left: -4px;\n  margin-top: -8px;\n  position: absolute;\n  top: 50%;\n  transform: rotate(45deg);\n  width: 8px; }\n\n.form-checkbox input:indeterminate + .form-icon {\n  background: #5755d9;\n  border-color: #5755d9; }\n  .form-checkbox input:indeterminate + .form-icon::before {\n    background: #fff;\n    content: \"\";\n    height: 2px;\n    left: 50%;\n    margin-left: -5px;\n    margin-top: -1px;\n    position: absolute;\n    top: 50%;\n    width: 10px; }\n\n.form-radio .form-icon {\n  border-radius: 50%; }\n\n.form-radio input:checked + .form-icon::before {\n  background: #fff;\n  border-radius: 50%;\n  content: \"\";\n  height: 4px;\n  left: 50%;\n  position: absolute;\n  top: 50%;\n  transform: translate(-50%, -50%);\n  width: 4px; }\n\n.form-switch {\n  padding-left: 2rem; }\n  .form-switch .form-icon {\n    background: #e7e9ed;\n    background-clip: padding-box;\n    border-radius: 0.45rem;\n    height: 0.9rem;\n    left: 0;\n    top: 0.25rem;\n    width: 1.6rem; }\n    .form-switch .form-icon::before {\n      transition: all .2s ease;\n      background: #fff;\n      border-radius: 50%;\n      content: \"\";\n      display: block;\n      height: 0.8rem;\n      left: 0;\n      position: absolute;\n      top: 0;\n      width: 0.8rem; }\n  .form-switch input:checked + .form-icon::before {\n    left: 14px; }\n  .form-switch input:active + .form-icon::before {\n    background: #f8f9fa; }\n\n.input-group {\n  display: flex; }\n  .input-group .input-group-addon {\n    background: #f8f9fa;\n    border: 0.05rem solid #caced7;\n    border-radius: 0.1rem;\n    line-height: 1rem;\n    padding: 0.35rem 0.4rem;\n    white-space: nowrap; }\n    .input-group .input-group-addon.addon-sm {\n      font-size: 0.7rem;\n      padding: 0.15rem 0.3rem; }\n    .input-group .input-group-addon.addon-lg {\n      font-size: 0.9rem;\n      padding: 0.45rem 0.6rem; }\n  .input-group .form-input,\n  .input-group .form-select {\n    flex: 1 1 auto; }\n  .input-group .input-group-btn {\n    z-index: 1; }\n  .input-group .form-input:first-child:not(:last-child),\n  .input-group .form-select:first-child:not(:last-child),\n  .input-group .input-group-addon:first-child:not(:last-child),\n  .input-group .input-group-btn:first-child:not(:last-child) {\n    border-bottom-right-radius: 0;\n    border-top-right-radius: 0; }\n  .input-group .form-input:not(:first-child):not(:last-child),\n  .input-group .form-select:not(:first-child):not(:last-child),\n  .input-group .input-group-addon:not(:first-child):not(:last-child),\n  .input-group .input-group-btn:not(:first-child):not(:last-child) {\n    border-radius: 0;\n    margin-left: -0.05rem; }\n  .input-group .form-input:last-child:not(:first-child),\n  .input-group .form-select:last-child:not(:first-child),\n  .input-group .input-group-addon:last-child:not(:first-child),\n  .input-group .input-group-btn:last-child:not(:first-child) {\n    border-bottom-left-radius: 0;\n    border-top-left-radius: 0;\n    margin-left: -0.05rem; }\n  .input-group .form-input:focus,\n  .input-group .form-select:focus,\n  .input-group .input-group-addon:focus,\n  .input-group .input-group-btn:focus {\n    z-index: 2; }\n  .input-group .form-select {\n    width: auto; }\n  .input-group.input-inline {\n    display: inline-flex; }\n\n.has-success .form-input, .form-input.is-success, .has-success\n.form-select,\n.form-select.is-success {\n  border-color: #32b643; }\n  .has-success .form-input:focus, .form-input.is-success:focus, .has-success\n  .form-select:focus,\n  .form-select.is-success:focus {\n    box-shadow: 0 0 0 0.1rem rgba(50, 182, 67, 0.2); }\n\n.has-error .form-input, .form-input.is-error, .has-error\n.form-select,\n.form-select.is-error {\n  border-color: #e85600; }\n  .has-error .form-input:focus, .form-input.is-error:focus, .has-error\n  .form-select:focus,\n  .form-select.is-error:focus {\n    box-shadow: 0 0 0 0.1rem rgba(232, 86, 0, 0.2); }\n\n.has-error .form-checkbox .form-icon, .form-checkbox.is-error .form-icon, .has-error\n.form-radio .form-icon,\n.form-radio.is-error .form-icon, .has-error\n.form-switch .form-icon,\n.form-switch.is-error .form-icon {\n  border-color: #e85600; }\n\n.has-error .form-checkbox input:checked + .form-icon, .form-checkbox.is-error input:checked + .form-icon, .has-error\n.form-radio input:checked + .form-icon,\n.form-radio.is-error input:checked + .form-icon, .has-error\n.form-switch input:checked + .form-icon,\n.form-switch.is-error input:checked + .form-icon {\n  background: #e85600;\n  border-color: #e85600; }\n\n.has-error .form-checkbox input:focus + .form-icon, .form-checkbox.is-error input:focus + .form-icon, .has-error\n.form-radio input:focus + .form-icon,\n.form-radio.is-error input:focus + .form-icon, .has-error\n.form-switch input:focus + .form-icon,\n.form-switch.is-error input:focus + .form-icon {\n  box-shadow: 0 0 0 0.1rem rgba(232, 86, 0, 0.2);\n  border-color: #e85600; }\n\n.form-input:not(:placeholder-shown):invalid {\n  border-color: #e85600; }\n  .form-input:not(:placeholder-shown):invalid:focus {\n    box-shadow: 0 0 0 0.1rem rgba(232, 86, 0, 0.2); }\n  .form-input:not(:placeholder-shown):invalid + .form-input-hint {\n    color: #e85600; }\n\n.form-input:disabled, .form-input.disabled,\n.form-select:disabled,\n.form-select.disabled {\n  background-color: #f0f1f4;\n  cursor: not-allowed;\n  opacity: .5; }\n\n.form-input[readonly] {\n  background-color: #f8f9fa; }\n\ninput:disabled + .form-icon, input.disabled + .form-icon {\n  background: #f0f1f4;\n  cursor: not-allowed;\n  opacity: .5; }\n\n.form-switch input:disabled + .form-icon::before, .form-switch input.disabled + .form-icon::before {\n  background: #fff; }\n\n.form-horizontal {\n  padding: 0.4rem 0; }\n  .form-horizontal .form-group {\n    display: flex;\n    flex-wrap: wrap; }\n\n.text-primary {\n  color: #5755d9; }\n\na.text-primary:focus, a.text-primary:hover {\n  color: #4240d4; }\n\n.text-secondary {\n  color: #e5e5f9; }\n\na.text-secondary:focus, a.text-secondary:hover {\n  color: #d1d0f4; }\n\n.text-gray {\n  color: #acb3c2; }\n\na.text-gray:focus, a.text-gray:hover {\n  color: #9ea6b7; }\n\n.text-light {\n  color: #fff; }\n\na.text-light:focus, a.text-light:hover {\n  color: #f2f2f2; }\n\n.text-success {\n  color: #32b643; }\n\na.text-success:focus, a.text-success:hover {\n  color: #2da23c; }\n\n.text-warning {\n  color: #ffb700; }\n\na.text-warning:focus, a.text-warning:hover {\n  color: #e6a500; }\n\n.text-error {\n  color: #e85600; }\n\na.text-error:focus, a.text-error:hover {\n  color: #cf4d00; }\n\n.bg-primary {\n  background: #5755d9;\n  color: #fff; }\n\n.bg-secondary {\n  background: #f1f1fc; }\n\n.bg-dark {\n  background: #454d5d;\n  color: #fff; }\n\n.bg-gray {\n  background: #f8f9fa; }\n\n.bg-success {\n  background: #32b643;\n  color: #fff; }\n\n.bg-warning {\n  background: #ffb700;\n  color: #fff; }\n\n.bg-error {\n  background: #e85600;\n  color: #fff; }\n\n.c-hand {\n  cursor: pointer; }\n\n.c-move {\n  cursor: move; }\n\n.c-zoom-in {\n  cursor: zoom-in; }\n\n.c-zoom-out {\n  cursor: zoom-out; }\n\n.c-not-allowed {\n  cursor: not-allowed; }\n\n.c-auto {\n  cursor: auto; }\n\n.d-block {\n  display: block; }\n\n.d-inline {\n  display: inline; }\n\n.d-inline-block {\n  display: inline-block; }\n\n.d-flex {\n  display: flex; }\n\n.d-inline-flex {\n  display: inline-flex; }\n\n.d-none,\n.d-hide {\n  display: none !important; }\n\n.d-visible {\n  visibility: visible; }\n\n.d-invisible {\n  visibility: hidden; }\n\n.text-hide {\n  background: transparent;\n  border: 0;\n  color: transparent;\n  font-size: 0;\n  line-height: 0;\n  text-shadow: none; }\n\n.text-assistive {\n  border: 0;\n  clip: rect(0, 0, 0, 0);\n  height: 1px;\n  margin: -1px;\n  overflow: hidden;\n  padding: 0;\n  position: absolute;\n  width: 1px; }\n\n.divider,\n.divider-vert {\n  display: block;\n  position: relative; }\n  .divider[data-content]::after,\n  .divider-vert[data-content]::after {\n    background: #fff;\n    color: #acb3c2;\n    content: attr(data-content);\n    display: inline-block;\n    font-size: 0.7rem;\n    padding: 0 0.4rem;\n    transform: translateY(-0.65rem); }\n\n.divider {\n  border-top: 0.05rem solid #e7e9ed;\n  height: 0.05rem;\n  margin: 0.4rem 0; }\n  .divider[data-content] {\n    margin: 0.8rem 0; }\n\n.divider-vert {\n  display: block;\n  padding: 0.8rem; }\n  .divider-vert::before {\n    border-left: 0.05rem solid #e7e9ed;\n    bottom: 0.4rem;\n    content: \"\";\n    display: block;\n    left: 50%;\n    position: absolute;\n    top: 0.4rem;\n    transform: translateX(-50%); }\n  .divider-vert[data-content]::after {\n    left: 50%;\n    padding: 0.2rem 0;\n    position: absolute;\n    top: 50%;\n    transform: translate(-50%, -50%); }\n\n.loading {\n  color: transparent !important;\n  min-height: 0.8rem;\n  pointer-events: none;\n  position: relative; }\n  .loading::after {\n    animation: loading 500ms infinite linear;\n    border: 0.1rem solid #5755d9;\n    border-radius: 50%;\n    border-right-color: transparent;\n    border-top-color: transparent;\n    content: \"\";\n    display: block;\n    height: 0.8rem;\n    left: 50%;\n    margin-left: -0.4rem;\n    margin-top: -0.4rem;\n    position: absolute;\n    top: 50%;\n    width: 0.8rem;\n    z-index: 1; }\n  .loading.loading-lg {\n    min-height: 2rem; }\n    .loading.loading-lg::after {\n      height: 1.6rem;\n      margin-left: -0.8rem;\n      margin-top: -0.8rem;\n      width: 1.6rem; }\n\n.clearfix::after {\n  clear: both;\n  content: \"\";\n  display: table; }\n\n.float-left {\n  float: left !important; }\n\n.float-right {\n  float: right !important; }\n\n.relative {\n  position: relative; }\n\n.absolute {\n  position: absolute; }\n\n.fixed {\n  position: fixed; }\n\n.centered {\n  display: block;\n  float: none;\n  margin-left: auto;\n  margin-right: auto; }\n\n.flex-centered {\n  align-items: center;\n  display: flex;\n  justify-content: center; }\n\n.m-0 {\n  margin: 0; }\n\n.mb-0 {\n  margin-bottom: 0; }\n\n.ml-0 {\n  margin-left: 0; }\n\n.mr-0 {\n  margin-right: 0; }\n\n.mt-0 {\n  margin-top: 0; }\n\n.mx-0 {\n  margin-left: 0;\n  margin-right: 0; }\n\n.my-0 {\n  margin-bottom: 0;\n  margin-top: 0; }\n\n.m-1 {\n  margin: 0.2rem; }\n\n.mb-1 {\n  margin-bottom: 0.2rem; }\n\n.ml-1 {\n  margin-left: 0.2rem; }\n\n.mr-1 {\n  margin-right: 0.2rem; }\n\n.mt-1 {\n  margin-top: 0.2rem; }\n\n.mx-1 {\n  margin-left: 0.2rem;\n  margin-right: 0.2rem; }\n\n.my-1 {\n  margin-bottom: 0.2rem;\n  margin-top: 0.2rem; }\n\n.m-2 {\n  margin: 0.4rem; }\n\n.mb-2 {\n  margin-bottom: 0.4rem; }\n\n.ml-2 {\n  margin-left: 0.4rem; }\n\n.mr-2 {\n  margin-right: 0.4rem; }\n\n.mt-2 {\n  margin-top: 0.4rem; }\n\n.mx-2 {\n  margin-left: 0.4rem;\n  margin-right: 0.4rem; }\n\n.my-2 {\n  margin-bottom: 0.4rem;\n  margin-top: 0.4rem; }\n\n.p-0 {\n  padding: 0; }\n\n.pb-0 {\n  padding-bottom: 0; }\n\n.pl-0 {\n  padding-left: 0; }\n\n.pr-0 {\n  padding-right: 0; }\n\n.pt-0 {\n  padding-top: 0; }\n\n.px-0 {\n  padding-left: 0;\n  padding-right: 0; }\n\n.py-0 {\n  padding-bottom: 0;\n  padding-top: 0; }\n\n.p-1 {\n  padding: 0.2rem; }\n\n.pb-1 {\n  padding-bottom: 0.2rem; }\n\n.pl-1 {\n  padding-left: 0.2rem; }\n\n.pr-1 {\n  padding-right: 0.2rem; }\n\n.pt-1 {\n  padding-top: 0.2rem; }\n\n.px-1 {\n  padding-left: 0.2rem;\n  padding-right: 0.2rem; }\n\n.py-1 {\n  padding-bottom: 0.2rem;\n  padding-top: 0.2rem; }\n\n.p-2 {\n  padding: 0.4rem; }\n\n.pb-2 {\n  padding-bottom: 0.4rem; }\n\n.pl-2 {\n  padding-left: 0.4rem; }\n\n.pr-2 {\n  padding-right: 0.4rem; }\n\n.pt-2 {\n  padding-top: 0.4rem; }\n\n.px-2 {\n  padding-left: 0.4rem;\n  padding-right: 0.4rem; }\n\n.py-2 {\n  padding-bottom: 0.4rem;\n  padding-top: 0.4rem; }\n\n.rounded {\n  border-radius: 0.1rem; }\n\n.circle {\n  border-radius: 50%; }\n\n.text-left {\n  text-align: left; }\n\n.text-right {\n  text-align: right; }\n\n.text-center {\n  text-align: center; }\n\n.text-justify {\n  text-align: justify; }\n\n.text-lowercase {\n  text-transform: lowercase; }\n\n.text-uppercase {\n  text-transform: uppercase; }\n\n.text-capitalize {\n  text-transform: capitalize; }\n\n.text-normal {\n  font-weight: normal; }\n\n.text-bold {\n  font-weight: bold; }\n\n.text-italic {\n  font-style: italic; }\n\n.text-large {\n  font-size: 1.2em; }\n\n.text-ellipsis {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap; }\n\n.text-clip {\n  overflow: hidden;\n  text-overflow: clip;\n  white-space: nowrap; }\n\n.text-break {\n  hyphens: auto;\n  word-break: break-word;\n  word-wrap: break-word; }\n\n/*! Spectre.css Icons v0.5.1 | MIT License | github.com/picturepan2/spectre */\n.icon {\n  box-sizing: border-box;\n  display: inline-block;\n  font-size: inherit;\n  font-style: normal;\n  height: 1em;\n  position: relative;\n  text-indent: -9999px;\n  vertical-align: middle;\n  width: 1em; }\n  .icon::before, .icon::after {\n    display: block;\n    left: 50%;\n    position: absolute;\n    top: 50%;\n    transform: translate(-50%, -50%); }\n  .icon.icon-2x {\n    font-size: 1.6rem; }\n  .icon.icon-3x {\n    font-size: 2.4rem; }\n  .icon.icon-4x {\n    font-size: 3.2rem; }\n\n.accordion .icon,\n.btn .icon,\n.toast .icon,\n.menu .icon {\n  vertical-align: -10%; }\n\n.btn-lg .icon {\n  vertical-align: -15%; }\n\n.icon-arrow-down::before,\n.icon-arrow-left::before,\n.icon-arrow-right::before,\n.icon-arrow-up::before,\n.icon-downward::before,\n.icon-back::before,\n.icon-forward::before,\n.icon-upward::before {\n  border: 0.1rem solid currentColor;\n  border-bottom: 0;\n  border-right: 0;\n  content: \"\";\n  height: .65em;\n  width: .65em; }\n\n.icon-arrow-down::before {\n  transform: translate(-50%, -75%) rotate(225deg); }\n\n.icon-arrow-left::before {\n  transform: translate(-25%, -50%) rotate(-45deg); }\n\n.icon-arrow-right::before {\n  transform: translate(-75%, -50%) rotate(135deg); }\n\n.icon-arrow-up::before {\n  transform: translate(-50%, -25%) rotate(45deg); }\n\n.icon-back::after,\n.icon-forward::after {\n  background: currentColor;\n  content: \"\";\n  height: 0.1rem;\n  width: .8em; }\n\n.icon-downward::after,\n.icon-upward::after {\n  background: currentColor;\n  content: \"\";\n  height: .8em;\n  width: 0.1rem; }\n\n.icon-back::after {\n  left: 55%; }\n\n.icon-back::before {\n  transform: translate(-50%, -50%) rotate(-45deg); }\n\n.icon-downward::after {\n  top: 45%; }\n\n.icon-downward::before {\n  transform: translate(-50%, -50%) rotate(-135deg); }\n\n.icon-forward::after {\n  left: 45%; }\n\n.icon-forward::before {\n  transform: translate(-50%, -50%) rotate(135deg); }\n\n.icon-upward::after {\n  top: 55%; }\n\n.icon-upward::before {\n  transform: translate(-50%, -50%) rotate(45deg); }\n\n.icon-caret::before {\n  border-top: .3em solid currentColor;\n  border-right: .3em solid transparent;\n  border-left: .3em solid transparent;\n  content: \"\";\n  height: 0;\n  transform: translate(-50%, -25%);\n  width: 0; }\n\n.icon-menu::before {\n  background: currentColor;\n  box-shadow: 0 -.35em, 0 .35em;\n  content: \"\";\n  height: 0.1rem;\n  width: 100%; }\n\n.icon-apps::before {\n  background: currentColor;\n  box-shadow: -.35em -.35em, -.35em 0, -.35em .35em, 0 -.35em, 0 .35em, .35em -.35em, .35em 0, .35em .35em;\n  content: \"\";\n  height: 3px;\n  width: 3px; }\n\n.icon-resize-horiz::before, .icon-resize-horiz::after,\n.icon-resize-vert::before,\n.icon-resize-vert::after {\n  border: 0.1rem solid currentColor;\n  border-bottom: 0;\n  border-right: 0;\n  content: \"\";\n  height: .45em;\n  width: .45em; }\n\n.icon-resize-horiz::before,\n.icon-resize-vert::before {\n  transform: translate(-50%, -90%) rotate(45deg); }\n\n.icon-resize-horiz::after,\n.icon-resize-vert::after {\n  transform: translate(-50%, -10%) rotate(225deg); }\n\n.icon-resize-horiz::before {\n  transform: translate(-90%, -50%) rotate(-45deg); }\n\n.icon-resize-horiz::after {\n  transform: translate(-10%, -50%) rotate(135deg); }\n\n.icon-more-horiz::before,\n.icon-more-vert::before {\n  background: currentColor;\n  box-shadow: -.4em 0, .4em 0;\n  border-radius: 50%;\n  content: \"\";\n  height: 3px;\n  width: 3px; }\n\n.icon-more-vert::before {\n  box-shadow: 0 -.4em, 0 .4em; }\n\n.icon-plus::before,\n.icon-minus::before,\n.icon-cross::before {\n  background: currentColor;\n  content: \"\";\n  height: 0.1rem;\n  width: 100%; }\n\n.icon-plus::after,\n.icon-cross::after {\n  background: currentColor;\n  content: \"\";\n  height: 100%;\n  width: 0.1rem; }\n\n.icon-cross::before {\n  width: 100%; }\n\n.icon-cross::after {\n  height: 100%; }\n\n.icon-cross::before, .icon-cross::after {\n  transform: translate(-50%, -50%) rotate(45deg); }\n\n.icon-check::before {\n  border: 0.1rem solid currentColor;\n  border-right: 0;\n  border-top: 0;\n  content: \"\";\n  height: .5em;\n  width: .9em;\n  transform: translate(-50%, -75%) rotate(-45deg); }\n\n.icon-stop {\n  border: 0.1rem solid currentColor;\n  border-radius: 50%; }\n  .icon-stop::before {\n    background: currentColor;\n    content: \"\";\n    height: 0.1rem;\n    transform: translate(-50%, -50%) rotate(45deg);\n    width: 1em; }\n\n.icon-shutdown {\n  border: 0.1rem solid currentColor;\n  border-radius: 50%;\n  border-top-color: transparent; }\n  .icon-shutdown::before {\n    background: currentColor;\n    content: \"\";\n    height: .5em;\n    top: .1em;\n    width: 0.1rem; }\n\n.icon-refresh::before {\n  border: 0.1rem solid currentColor;\n  border-radius: 50%;\n  border-right-color: transparent;\n  content: \"\";\n  height: 1em;\n  width: 1em; }\n\n.icon-refresh::after {\n  border: .2em solid currentColor;\n  border-top-color: transparent;\n  border-left-color: transparent;\n  content: \"\";\n  height: 0;\n  left: 80%;\n  top: 20%;\n  width: 0; }\n\n.icon-search::before {\n  border: 0.1rem solid currentColor;\n  border-radius: 50%;\n  content: \"\";\n  height: .75em;\n  left: 5%;\n  top: 5%;\n  transform: translate(0, 0) rotate(45deg);\n  width: .75em; }\n\n.icon-search::after {\n  background: currentColor;\n  content: \"\";\n  height: 0.1rem;\n  left: 80%;\n  top: 80%;\n  transform: translate(-50%, -50%) rotate(45deg);\n  width: .4em; }\n\n.icon-edit::before {\n  border: 0.1rem solid currentColor;\n  content: \"\";\n  height: .4em;\n  transform: translate(-40%, -60%) rotate(-45deg);\n  width: .85em; }\n\n.icon-edit::after {\n  border: .15em solid currentColor;\n  border-top-color: transparent;\n  border-right-color: transparent;\n  content: \"\";\n  height: 0;\n  left: 5%;\n  top: 95%;\n  transform: translate(0, -100%);\n  width: 0; }\n\n.icon-delete::before {\n  border: 0.1rem solid currentColor;\n  border-bottom-left-radius: 0.1rem;\n  border-bottom-right-radius: 0.1rem;\n  border-top: 0;\n  content: \"\";\n  height: .75em;\n  top: 60%;\n  width: .75em; }\n\n.icon-delete::after {\n  background: currentColor;\n  box-shadow: -.25em .2em, .25em .2em;\n  content: \"\";\n  height: 0.1rem;\n  top: 0.05rem;\n  width: .5em; }\n\n.icon-share {\n  border: 0.1rem solid currentColor;\n  border-radius: 0.1rem;\n  border-right: 0;\n  border-top: 0; }\n  .icon-share::before {\n    border: 0.1rem solid currentColor;\n    border-left: 0;\n    border-top: 0;\n    content: \"\";\n    height: .4em;\n    left: 100%;\n    top: .25em;\n    transform: translate(-125%, -50%) rotate(-45deg);\n    width: .4em; }\n  .icon-share::after {\n    border: 0.1rem solid currentColor;\n    border-bottom: 0;\n    border-right: 0;\n    border-radius: 75% 0;\n    content: \"\";\n    height: .5em;\n    width: .6em; }\n\n.icon-flag::before {\n  background: currentColor;\n  content: \"\";\n  height: 1em;\n  left: 15%;\n  width: 0.1rem; }\n\n.icon-flag::after {\n  border: 0.1rem solid currentColor;\n  border-bottom-right-radius: 0.1rem;\n  border-left: 0;\n  border-top-right-radius: 0.1rem;\n  content: \"\";\n  height: .65em;\n  top: 35%;\n  left: 60%;\n  width: .8em; }\n\n.icon-bookmark::before {\n  border: 0.1rem solid currentColor;\n  border-bottom: 0;\n  border-top-left-radius: 0.1rem;\n  border-top-right-radius: 0.1rem;\n  content: \"\";\n  height: .9em;\n  width: .8em; }\n\n.icon-bookmark::after {\n  border: 0.1rem solid currentColor;\n  border-bottom: 0;\n  border-left: 0;\n  border-radius: 0.1rem;\n  content: \"\";\n  height: .5em;\n  transform: translate(-50%, 35%) rotate(-45deg) skew(15deg, 15deg);\n  width: .5em; }\n\n.icon-download,\n.icon-upload {\n  border-bottom: 0.1rem solid currentColor; }\n  .icon-download::before,\n  .icon-upload::before {\n    border: 0.1rem solid currentColor;\n    border-bottom: 0;\n    border-right: 0;\n    content: \"\";\n    height: .5em;\n    width: .5em;\n    transform: translate(-50%, -60%) rotate(-135deg); }\n  .icon-download::after,\n  .icon-upload::after {\n    background: currentColor;\n    content: \"\";\n    height: .6em;\n    top: 40%;\n    width: 0.1rem; }\n\n.icon-upload::before {\n  transform: translate(-50%, -60%) rotate(45deg); }\n\n.icon-upload::after {\n  top: 50%; }\n\n.icon-time {\n  border: 0.1rem solid currentColor;\n  border-radius: 50%; }\n  .icon-time::before {\n    background: currentColor;\n    content: \"\";\n    height: .4em;\n    transform: translate(-50%, -75%);\n    width: 0.1rem; }\n  .icon-time::after {\n    background: currentColor;\n    content: \"\";\n    height: .3em;\n    transform: translate(-50%, -75%) rotate(90deg);\n    transform-origin: 50% 90%;\n    width: 0.1rem; }\n\n.icon-mail::before {\n  border: 0.1rem solid currentColor;\n  border-radius: 0.1rem;\n  content: \"\";\n  height: .8em;\n  width: 1em; }\n\n.icon-mail::after {\n  border: 0.1rem solid currentColor;\n  border-right: 0;\n  border-top: 0;\n  content: \"\";\n  height: .5em;\n  transform: translate(-50%, -90%) rotate(-45deg) skew(10deg, 10deg);\n  width: .5em; }\n\n.icon-people::before {\n  border: 0.1rem solid currentColor;\n  border-radius: 50%;\n  content: \"\";\n  height: .45em;\n  top: 25%;\n  width: .45em; }\n\n.icon-people::after {\n  border: 0.1rem solid currentColor;\n  border-radius: 50% 50% 0 0;\n  content: \"\";\n  height: .4em;\n  top: 75%;\n  width: .9em; }\n\n.icon-message {\n  border: 0.1rem solid currentColor;\n  border-bottom: 0;\n  border-radius: 0.1rem;\n  border-right: 0; }\n  .icon-message::before {\n    border: 0.1rem solid currentColor;\n    border-bottom-right-radius: 0.1rem;\n    border-left: 0;\n    border-top: 0;\n    content: \"\";\n    height: .8em;\n    left: 65%;\n    top: 40%;\n    width: .7em; }\n  .icon-message::after {\n    background: currentColor;\n    border-radius: 0.1rem;\n    content: \"\";\n    height: .3em;\n    left: 10%;\n    top: 100%;\n    transform: translate(0, -90%) rotate(45deg);\n    width: 0.1rem; }\n\n.icon-photo {\n  border: 0.1rem solid currentColor;\n  border-radius: 0.1rem; }\n  .icon-photo::before {\n    border: 0.1rem solid currentColor;\n    border-radius: 50%;\n    content: \"\";\n    height: .25em;\n    left: 35%;\n    top: 35%;\n    width: .25em; }\n  .icon-photo::after {\n    border: 0.1rem solid currentColor;\n    border-bottom: 0;\n    border-left: 0;\n    content: \"\";\n    height: .5em;\n    left: 60%;\n    transform: translate(-50%, 25%) rotate(-45deg);\n    width: .5em; }\n\n.icon-link::before, .icon-link::after {\n  border: 0.1rem solid currentColor;\n  border-radius: 5em 0 0 5em;\n  border-right: 0;\n  content: \"\";\n  height: .5em;\n  width: .75em; }\n\n.icon-link::before {\n  transform: translate(-70%, -45%) rotate(-45deg); }\n\n.icon-link::after {\n  transform: translate(-30%, -55%) rotate(135deg); }\n\n.icon-location::before {\n  border: 0.1rem solid currentColor;\n  border-radius: 50% 50% 50% 0;\n  content: \"\";\n  height: .8em;\n  transform: translate(-50%, -60%) rotate(-45deg);\n  width: .8em; }\n\n.icon-location::after {\n  border: 0.1rem solid currentColor;\n  border-radius: 50%;\n  content: \"\";\n  height: .2em;\n  transform: translate(-50%, -80%);\n  width: .2em; }\n\n.icon-emoji {\n  border: 0.1rem solid currentColor;\n  border-radius: 50%; }\n  .icon-emoji::before {\n    border-radius: 50%;\n    box-shadow: -.17em -.15em, .17em -.15em;\n    content: \"\";\n    height: .1em;\n    width: .1em; }\n  .icon-emoji::after {\n    border: 0.1rem solid currentColor;\n    border-bottom-color: transparent;\n    border-radius: 50%;\n    border-right-color: transparent;\n    content: \"\";\n    height: .5em;\n    transform: translate(-50%, -40%) rotate(-135deg);\n    width: .5em; }\n\nspan.icon-caret-right::before {\n  border-top: 0.3em solid currentColor;\n  border-right: 0.3em solid transparent;\n  border-left: 0.3em solid transparent;\n  content: \"\";\n  height: 0;\n  transform: translate(-50%, -50%) rotate(-90deg);\n  width: 0; }\n\n.scrollable {\n  display: flex;\n  overflow: auto; }\n  .scrollable .scrollable-content {\n    display: flex;\n    min-height: 0px;\n    min-width: 0px;\n    flex-grow: 1; }\n\n.run-action-item-count {\n  color: orange; }\n\n.run-action-item {\n  margin: 0rem;\n  width: 100%; }\n  .run-action-item .item-link {\n    display: block;\n    color: black; }\n    .run-action-item .item-link:hover {\n      background-color: #f1f1fc;\n      text-decoration: none;\n      color: black; }\n    .run-action-item .item-link:focus {\n      text-decoration: none; }\n    .run-action-item .item-link.selected {\n      background-color: #e5e5f9;\n      font-weight: bold;\n      color: black; }\n  .run-action-item .icon:hover {\n    color: #5755d9; }\n";
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
        return h("span", { class: "icon" });
    }
    var onclick = function (e) {
        event.stopPropagation();
        event.preventDefault();
        actions$$1.toggleAction({ run: run.id, path: path });
    };
    if (action.collapsed) {
        return h("span", { class: "icon icon-caret-right", onclick: onclick });
    }
    return h("span", { class: "icon icon-caret", onclick: onclick });
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
        ? "Initial State"
        : action.name + "(" + getActionDataText(action) + ")";
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
        h("h6", null,
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

var css$20 = ".debug-pane {\n  display: flex;\n  flex-direction: column;\n  width: 100%;\n  height: 100%;\n  background: #fefefe;\n  border: 1px solid black;\n  color: black; }\n";
styleInject(css$20);

function DebugPane(props) {
    var state = props.state, actions = props.actions;
    var runs = getRuns(state);
    return (h("div", { class: "debug-pane" },
        DebugPaneToolbar({ state: state, actions: actions, runs: runs }),
        DebuggerOptions({ state: state, actions: actions }),
        DebugPaneContent({ state: state, actions: actions, runs: runs })));
}
//# sourceMappingURL=DebugPane.js.map

var css$22 = ".toggle-pane-button {\n  position: fixed;\n  right: 2%;\n  bottom: 2%; }\n  .toggle-pane-button:hover {\n    background: #efefef; }\n  .toggle-pane-button:active {\n    background: #dddddd; }\n";
styleInject(css$22);

function TogglePaneButton(props) {
    var state = props.state, actions = props.actions;
    return (h("button", { class: "btn toggle-pane-button", onclick: function () { return actions.showPane(!state.paneShown); } }, "Devtools"));
}
//# sourceMappingURL=TogglePaneButton.js.map

//# sourceMappingURL=index.js.map

var css$24 = ".devtools-overlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  height: 100vh;\n  width: 100vw;\n  z-index: 10; }\n  .devtools-overlay.align-right {\n    width: 50vw;\n    left: 50vw; }\n  .devtools-overlay.align-bottom {\n    height: 50vh;\n    top: 50vh; }\n";
styleInject(css$24);

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
    var namespace = prefix ? prefix + "." : "";
    return Object.keys(actions || {}).reduce(function (otherActions, name) {
        var fnName = actions[name].name || name;
        var namedspacedName = namespace + fnName;
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
