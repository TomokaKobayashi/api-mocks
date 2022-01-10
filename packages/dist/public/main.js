/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "../../node_modules/@hyperapp/logger/src/defaultLog.js":
/*!*************************************************************!*\
  !*** ../../node_modules/@hyperapp/logger/src/defaultLog.js ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* export default binding */ __WEBPACK_DEFAULT_EXPORT__; }\n/* harmony export */ });\n/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(prevState, action, nextState) {\n  console.group(\"%c action\", \"color: gray; font-weight: lighter;\", action.name)\n  console.log(\"%c prev state\", \"color: #9E9E9E; font-weight: bold;\", prevState)\n  console.log(\"%c data\", \"color: #03A9F4; font-weight: bold;\", action.data)\n  console.log(\"%c next state\", \"color: #4CAF50; font-weight: bold;\", nextState)\n  console.groupEnd()\n}\n\n\n//# sourceURL=webpack://client/../../node_modules/@hyperapp/logger/src/defaultLog.js?");

/***/ }),

/***/ "../../node_modules/@hyperapp/logger/src/index.js":
/*!********************************************************!*\
  !*** ../../node_modules/@hyperapp/logger/src/index.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"withLogger\": function() { return /* binding */ withLogger; }\n/* harmony export */ });\n/* harmony import */ var _defaultLog__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./defaultLog */ \"../../node_modules/@hyperapp/logger/src/defaultLog.js\");\n\n\nvar isFn = function(value) {\n  return typeof value === \"function\"\n}\n\nfunction makeLoggerApp(log, nextApp) {\n  return function(initialState, actionsTemplate, view, container) {\n    function enhanceActions(actions, prefix) {\n      var namespace = prefix ? prefix + \".\" : \"\"\n      return Object.keys(actions || {}).reduce(function(otherActions, name) {\n        var namedspacedName = namespace + name\n        var action = actions[name]\n        otherActions[name] =\n          typeof action === \"function\"\n            ? function(data) {\n                return function(state, actions) {\n                  var result = action(data)\n                  result =\n                    typeof result === \"function\"\n                      ? result(state, actions)\n                      : result\n                  log(state, { name: namedspacedName, data: data }, result)\n                  return result\n                }\n              }\n            : enhanceActions(action, namedspacedName)\n        return otherActions\n      }, {})\n    }\n\n    var enhancedActions = enhanceActions(actionsTemplate)\n\n    var appActions = nextApp(initialState, enhancedActions, view, container)\n    return appActions\n  }\n}\n\nfunction withLogger(optionsOrApp) {\n  if (isFn(optionsOrApp)) {\n    return makeLoggerApp(_defaultLog__WEBPACK_IMPORTED_MODULE_0__[\"default\"], optionsOrApp)\n  } else {\n    var log = isFn(optionsOrApp.log) ? optionsOrApp.log : _defaultLog__WEBPACK_IMPORTED_MODULE_0__[\"default\"]\n    return function(nextApp) {\n      return makeLoggerApp(log, nextApp)\n    }\n  }\n}\n\n\n//# sourceURL=webpack://client/../../node_modules/@hyperapp/logger/src/index.js?");

/***/ }),

/***/ "../../node_modules/@hyperapp/router/src/Link.js":
/*!*******************************************************!*\
  !*** ../../node_modules/@hyperapp/router/src/Link.js ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"Link\": function() { return /* binding */ Link; }\n/* harmony export */ });\n/* harmony import */ var hyperapp__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! hyperapp */ \"../../node_modules/hyperapp/src/index.js\");\n\n\nfunction getOrigin(loc) {\n  return loc.protocol + \"//\" + loc.hostname + (loc.port ? \":\" + loc.port : \"\")\n}\n\nfunction isExternal(anchorElement) {\n  // Location.origin and HTMLAnchorElement.origin are not\n  // supported by IE and Safari.\n  return getOrigin(location) !== getOrigin(anchorElement)\n}\n\nfunction Link(props, children) {\n  return function(state, actions) {\n    var to = props.to\n    var location = state.location\n    var onclick = props.onclick\n    delete props.to\n    delete props.location\n\n    props.href = to\n    props.onclick = function(e) {\n      if (onclick) {\n        onclick(e)\n      }\n      if (\n        e.defaultPrevented ||\n        e.button !== 0 ||\n        e.altKey ||\n        e.metaKey ||\n        e.ctrlKey ||\n        e.shiftKey ||\n        props.target === \"_blank\" ||\n        isExternal(e.currentTarget)\n      ) {\n      } else {\n        e.preventDefault()\n\n        if (to !== location.pathname) {\n          history.pushState(location.pathname, \"\", to)\n        }\n      }\n    }\n\n    return (0,hyperapp__WEBPACK_IMPORTED_MODULE_0__.h)(\"a\", props, children)\n  }\n}\n\n\n//# sourceURL=webpack://client/../../node_modules/@hyperapp/router/src/Link.js?");

/***/ }),

/***/ "../../node_modules/@hyperapp/router/src/Redirect.js":
/*!***********************************************************!*\
  !*** ../../node_modules/@hyperapp/router/src/Redirect.js ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"Redirect\": function() { return /* binding */ Redirect; }\n/* harmony export */ });\nfunction Redirect(props) {\n  return function(state, actions) {\n    var location = state.location\n    history.replaceState(props.from || location.pathname, \"\", props.to)\n  }\n}\n\n\n//# sourceURL=webpack://client/../../node_modules/@hyperapp/router/src/Redirect.js?");

/***/ }),

/***/ "../../node_modules/@hyperapp/router/src/Route.js":
/*!********************************************************!*\
  !*** ../../node_modules/@hyperapp/router/src/Route.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"Route\": function() { return /* binding */ Route; }\n/* harmony export */ });\n/* harmony import */ var _parseRoute__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./parseRoute */ \"../../node_modules/@hyperapp/router/src/parseRoute.js\");\n\n\nfunction Route(props) {\n  return function(state, actions) {\n    var location = state.location\n    var match = (0,_parseRoute__WEBPACK_IMPORTED_MODULE_0__.parseRoute)(props.path, location.pathname, {\n      exact: !props.parent\n    })\n\n    return (\n      match &&\n      props.render({\n        match: match,\n        location: location\n      })\n    )\n  }\n}\n\n\n//# sourceURL=webpack://client/../../node_modules/@hyperapp/router/src/Route.js?");

/***/ }),

/***/ "../../node_modules/@hyperapp/router/src/Switch.js":
/*!*********************************************************!*\
  !*** ../../node_modules/@hyperapp/router/src/Switch.js ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"Switch\": function() { return /* binding */ Switch; }\n/* harmony export */ });\nfunction Switch(props, children) {\n  return function(state, actions) {\n    var child,\n      i = 0\n    while (\n      !(child = children[i] && children[i](state, actions)) &&\n      i < children.length\n    )\n      i++\n    return child\n  }\n}\n\n\n//# sourceURL=webpack://client/../../node_modules/@hyperapp/router/src/Switch.js?");

/***/ }),

/***/ "../../node_modules/@hyperapp/router/src/index.js":
/*!********************************************************!*\
  !*** ../../node_modules/@hyperapp/router/src/index.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"Link\": function() { return /* reexport safe */ _Link__WEBPACK_IMPORTED_MODULE_0__.Link; },\n/* harmony export */   \"Route\": function() { return /* reexport safe */ _Route__WEBPACK_IMPORTED_MODULE_1__.Route; },\n/* harmony export */   \"Switch\": function() { return /* reexport safe */ _Switch__WEBPACK_IMPORTED_MODULE_2__.Switch; },\n/* harmony export */   \"Redirect\": function() { return /* reexport safe */ _Redirect__WEBPACK_IMPORTED_MODULE_3__.Redirect; },\n/* harmony export */   \"location\": function() { return /* reexport safe */ _location__WEBPACK_IMPORTED_MODULE_4__.location; }\n/* harmony export */ });\n/* harmony import */ var _Link__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Link */ \"../../node_modules/@hyperapp/router/src/Link.js\");\n/* harmony import */ var _Route__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Route */ \"../../node_modules/@hyperapp/router/src/Route.js\");\n/* harmony import */ var _Switch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Switch */ \"../../node_modules/@hyperapp/router/src/Switch.js\");\n/* harmony import */ var _Redirect__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Redirect */ \"../../node_modules/@hyperapp/router/src/Redirect.js\");\n/* harmony import */ var _location__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./location */ \"../../node_modules/@hyperapp/router/src/location.js\");\n\n\n\n\n\n\n\n//# sourceURL=webpack://client/../../node_modules/@hyperapp/router/src/index.js?");

/***/ }),

/***/ "../../node_modules/@hyperapp/router/src/location.js":
/*!***********************************************************!*\
  !*** ../../node_modules/@hyperapp/router/src/location.js ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"location\": function() { return /* binding */ location; }\n/* harmony export */ });\nfunction wrapHistory(keys) {\n  return keys.reduce(function(next, key) {\n    var fn = history[key]\n\n    history[key] = function(data, title, url) {\n      fn.call(this, data, title, url)\n      dispatchEvent(new CustomEvent(\"pushstate\", { detail: data }))\n    }\n\n    return function() {\n      history[key] = fn\n      next && next()\n    }\n  }, null)\n}\n\nvar location = {\n  state: {\n    pathname: window.location.pathname,\n    previous: window.location.pathname\n  },\n  actions: {\n    go: function(pathname) {\n      history.pushState(null, \"\", pathname)\n    },\n    set: function(data) {\n      return data\n    }\n  },\n  subscribe: function(actions) {\n    function handleLocationChange(e) {\n      actions.set({\n        pathname: window.location.pathname,\n        previous: e.detail\n          ? (window.location.previous = e.detail)\n          : window.location.previous\n      })\n    }\n\n    var unwrap = wrapHistory([\"pushState\", \"replaceState\"])\n\n    addEventListener(\"pushstate\", handleLocationChange)\n    addEventListener(\"popstate\", handleLocationChange)\n\n    return function() {\n      removeEventListener(\"pushstate\", handleLocationChange)\n      removeEventListener(\"popstate\", handleLocationChange)\n      unwrap()\n    }\n  }\n}\n\n\n//# sourceURL=webpack://client/../../node_modules/@hyperapp/router/src/location.js?");

/***/ }),

/***/ "../../node_modules/@hyperapp/router/src/parseRoute.js":
/*!*************************************************************!*\
  !*** ../../node_modules/@hyperapp/router/src/parseRoute.js ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"parseRoute\": function() { return /* binding */ parseRoute; }\n/* harmony export */ });\nfunction createMatch(isExact, path, url, params) {\n  return {\n    isExact: isExact,\n    path: path,\n    url: url,\n    params: params\n  }\n}\n\nfunction trimTrailingSlash(url) {\n  for (var len = url.length; \"/\" === url[--len]; );\n  return url.slice(0, len + 1)\n}\n\nfunction decodeParam(val) {\n  try {\n    return decodeURIComponent(val)\n  } catch (e) {\n    return val\n  }\n}\n\nfunction parseRoute(path, url, options) {\n  if (path === url || !path) {\n    return createMatch(path === url, path, url)\n  }\n\n  var exact = options && options.exact\n  var paths = trimTrailingSlash(path).split(\"/\")\n  var urls = trimTrailingSlash(url).split(\"/\")\n\n  if (paths.length > urls.length || (exact && paths.length < urls.length)) {\n    return\n  }\n\n  for (var i = 0, params = {}, len = paths.length, url = \"\"; i < len; i++) {\n    if (\":\" === paths[i][0]) {\n      params[paths[i].slice(1)] = urls[i] = decodeParam(urls[i])\n    } else if (paths[i] !== urls[i]) {\n      return\n    }\n    url += urls[i] + \"/\"\n  }\n\n  return createMatch(false, path, url.slice(0, -1), params)\n}\n\n\n//# sourceURL=webpack://client/../../node_modules/@hyperapp/router/src/parseRoute.js?");

/***/ }),

/***/ "../../node_modules/hyperapp/src/index.js":
/*!************************************************!*\
  !*** ../../node_modules/hyperapp/src/index.js ***!
  \************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"h\": function() { return /* binding */ h; },\n/* harmony export */   \"app\": function() { return /* binding */ app; }\n/* harmony export */ });\nfunction h(name, attributes) {\n  var rest = []\n  var children = []\n  var length = arguments.length\n\n  while (length-- > 2) rest.push(arguments[length])\n\n  while (rest.length) {\n    var node = rest.pop()\n    if (node && node.pop) {\n      for (length = node.length; length--; ) {\n        rest.push(node[length])\n      }\n    } else if (node != null && node !== true && node !== false) {\n      children.push(node)\n    }\n  }\n\n  return typeof name === \"function\"\n    ? name(attributes || {}, children)\n    : {\n        nodeName: name,\n        attributes: attributes || {},\n        children: children,\n        key: attributes && attributes.key\n      }\n}\n\nfunction app(state, actions, view, container) {\n  var map = [].map\n  var rootElement = (container && container.children[0]) || null\n  var oldNode = rootElement && recycleElement(rootElement)\n  var lifecycle = []\n  var skipRender\n  var isRecycling = true\n  var globalState = clone(state)\n  var wiredActions = wireStateToActions([], globalState, clone(actions))\n\n  scheduleRender()\n\n  return wiredActions\n\n  function recycleElement(element) {\n    return {\n      nodeName: element.nodeName.toLowerCase(),\n      attributes: {},\n      children: map.call(element.childNodes, function(element) {\n        return element.nodeType === 3 // Node.TEXT_NODE\n          ? element.nodeValue\n          : recycleElement(element)\n      })\n    }\n  }\n\n  function resolveNode(node) {\n    return typeof node === \"function\"\n      ? resolveNode(node(globalState, wiredActions))\n      : node != null\n        ? node\n        : \"\"\n  }\n\n  function render() {\n    skipRender = !skipRender\n\n    var node = resolveNode(view)\n\n    if (container && !skipRender) {\n      rootElement = patch(container, rootElement, oldNode, (oldNode = node))\n    }\n\n    isRecycling = false\n\n    while (lifecycle.length) lifecycle.pop()()\n  }\n\n  function scheduleRender() {\n    if (!skipRender) {\n      skipRender = true\n      setTimeout(render)\n    }\n  }\n\n  function clone(target, source) {\n    var out = {}\n\n    for (var i in target) out[i] = target[i]\n    for (var i in source) out[i] = source[i]\n\n    return out\n  }\n\n  function setPartialState(path, value, source) {\n    var target = {}\n    if (path.length) {\n      target[path[0]] =\n        path.length > 1\n          ? setPartialState(path.slice(1), value, source[path[0]])\n          : value\n      return clone(source, target)\n    }\n    return value\n  }\n\n  function getPartialState(path, source) {\n    var i = 0\n    while (i < path.length) {\n      source = source[path[i++]]\n    }\n    return source\n  }\n\n  function wireStateToActions(path, state, actions) {\n    for (var key in actions) {\n      typeof actions[key] === \"function\"\n        ? (function(key, action) {\n            actions[key] = function(data) {\n              var result = action(data)\n\n              if (typeof result === \"function\") {\n                result = result(getPartialState(path, globalState), actions)\n              }\n\n              if (\n                result &&\n                result !== (state = getPartialState(path, globalState)) &&\n                !result.then // !isPromise\n              ) {\n                scheduleRender(\n                  (globalState = setPartialState(\n                    path,\n                    clone(state, result),\n                    globalState\n                  ))\n                )\n              }\n\n              return result\n            }\n          })(key, actions[key])\n        : wireStateToActions(\n            path.concat(key),\n            (state[key] = clone(state[key])),\n            (actions[key] = clone(actions[key]))\n          )\n    }\n\n    return actions\n  }\n\n  function getKey(node) {\n    return node ? node.key : null\n  }\n\n  function eventListener(event) {\n    return event.currentTarget.events[event.type](event)\n  }\n\n  function updateAttribute(element, name, value, oldValue, isSvg) {\n    if (name === \"key\") {\n    } else if (name === \"style\") {\n      if (typeof value === \"string\") {\n        element.style.cssText = value\n      } else {\n        if (typeof oldValue === \"string\") oldValue = element.style.cssText = \"\"\n        for (var i in clone(oldValue, value)) {\n          var style = value == null || value[i] == null ? \"\" : value[i]\n          if (i[0] === \"-\") {\n            element.style.setProperty(i, style)\n          } else {\n            element.style[i] = style\n          }\n        }\n      }\n    } else {\n      if (name[0] === \"o\" && name[1] === \"n\") {\n        name = name.slice(2)\n\n        if (element.events) {\n          if (!oldValue) oldValue = element.events[name]\n        } else {\n          element.events = {}\n        }\n\n        element.events[name] = value\n\n        if (value) {\n          if (!oldValue) {\n            element.addEventListener(name, eventListener)\n          }\n        } else {\n          element.removeEventListener(name, eventListener)\n        }\n      } else if (\n        name in element &&\n        name !== \"list\" &&\n        name !== \"type\" &&\n        name !== \"draggable\" &&\n        name !== \"spellcheck\" &&\n        name !== \"translate\" &&\n        !isSvg\n      ) {\n        element[name] = value == null ? \"\" : value\n      } else if (value != null && value !== false) {\n        element.setAttribute(name, value)\n      }\n\n      if (value == null || value === false) {\n        element.removeAttribute(name)\n      }\n    }\n  }\n\n  function createElement(node, isSvg) {\n    var element =\n      typeof node === \"string\" || typeof node === \"number\"\n        ? document.createTextNode(node)\n        : (isSvg = isSvg || node.nodeName === \"svg\")\n          ? document.createElementNS(\n              \"http://www.w3.org/2000/svg\",\n              node.nodeName\n            )\n          : document.createElement(node.nodeName)\n\n    var attributes = node.attributes\n    if (attributes) {\n      if (attributes.oncreate) {\n        lifecycle.push(function() {\n          attributes.oncreate(element)\n        })\n      }\n\n      for (var i = 0; i < node.children.length; i++) {\n        element.appendChild(\n          createElement(\n            (node.children[i] = resolveNode(node.children[i])),\n            isSvg\n          )\n        )\n      }\n\n      for (var name in attributes) {\n        updateAttribute(element, name, attributes[name], null, isSvg)\n      }\n    }\n\n    return element\n  }\n\n  function updateElement(element, oldAttributes, attributes, isSvg) {\n    for (var name in clone(oldAttributes, attributes)) {\n      if (\n        attributes[name] !==\n        (name === \"value\" || name === \"checked\"\n          ? element[name]\n          : oldAttributes[name])\n      ) {\n        updateAttribute(\n          element,\n          name,\n          attributes[name],\n          oldAttributes[name],\n          isSvg\n        )\n      }\n    }\n\n    var cb = isRecycling ? attributes.oncreate : attributes.onupdate\n    if (cb) {\n      lifecycle.push(function() {\n        cb(element, oldAttributes)\n      })\n    }\n  }\n\n  function removeChildren(element, node) {\n    var attributes = node.attributes\n    if (attributes) {\n      for (var i = 0; i < node.children.length; i++) {\n        removeChildren(element.childNodes[i], node.children[i])\n      }\n\n      if (attributes.ondestroy) {\n        attributes.ondestroy(element)\n      }\n    }\n    return element\n  }\n\n  function removeElement(parent, element, node) {\n    function done() {\n      parent.removeChild(removeChildren(element, node))\n    }\n\n    var cb = node.attributes && node.attributes.onremove\n    if (cb) {\n      cb(element, done)\n    } else {\n      done()\n    }\n  }\n\n  function patch(parent, element, oldNode, node, isSvg) {\n    if (node === oldNode) {\n    } else if (oldNode == null || oldNode.nodeName !== node.nodeName) {\n      var newElement = createElement(node, isSvg)\n      parent.insertBefore(newElement, element)\n\n      if (oldNode != null) {\n        removeElement(parent, element, oldNode)\n      }\n\n      element = newElement\n    } else if (oldNode.nodeName == null) {\n      element.nodeValue = node\n    } else {\n      updateElement(\n        element,\n        oldNode.attributes,\n        node.attributes,\n        (isSvg = isSvg || node.nodeName === \"svg\")\n      )\n\n      var oldKeyed = {}\n      var newKeyed = {}\n      var oldElements = []\n      var oldChildren = oldNode.children\n      var children = node.children\n\n      for (var i = 0; i < oldChildren.length; i++) {\n        oldElements[i] = element.childNodes[i]\n\n        var oldKey = getKey(oldChildren[i])\n        if (oldKey != null) {\n          oldKeyed[oldKey] = [oldElements[i], oldChildren[i]]\n        }\n      }\n\n      var i = 0\n      var k = 0\n\n      while (k < children.length) {\n        var oldKey = getKey(oldChildren[i])\n        var newKey = getKey((children[k] = resolveNode(children[k])))\n\n        if (newKeyed[oldKey]) {\n          i++\n          continue\n        }\n\n        if (newKey != null && newKey === getKey(oldChildren[i + 1])) {\n          if (oldKey == null) {\n            removeElement(element, oldElements[i], oldChildren[i])\n          }\n          i++\n          continue\n        }\n\n        if (newKey == null || isRecycling) {\n          if (oldKey == null) {\n            patch(element, oldElements[i], oldChildren[i], children[k], isSvg)\n            k++\n          }\n          i++\n        } else {\n          var keyedNode = oldKeyed[newKey] || []\n\n          if (oldKey === newKey) {\n            patch(element, keyedNode[0], keyedNode[1], children[k], isSvg)\n            i++\n          } else if (keyedNode[0]) {\n            patch(\n              element,\n              element.insertBefore(keyedNode[0], oldElements[i]),\n              keyedNode[1],\n              children[k],\n              isSvg\n            )\n          } else {\n            patch(element, oldElements[i], null, children[k], isSvg)\n          }\n\n          newKeyed[newKey] = children[k]\n          k++\n        }\n      }\n\n      while (i < oldChildren.length) {\n        if (getKey(oldChildren[i]) == null) {\n          removeElement(element, oldElements[i], oldChildren[i])\n        }\n        i++\n      }\n\n      for (var i in oldKeyed) {\n        if (!newKeyed[i]) {\n          removeElement(element, oldKeyed[i][0], oldKeyed[i][1])\n        }\n      }\n    }\n    return element\n  }\n}\n\n\n//# sourceURL=webpack://client/../../node_modules/hyperapp/src/index.js?");

/***/ }),

/***/ "./src/components/about.tsx":
/*!**********************************!*\
  !*** ./src/components/about.tsx ***!
  \**********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.About = void 0;\nconst hyperapp_1 = __webpack_require__(/*! hyperapp */ \"../../node_modules/hyperapp/src/index.js\");\nconst router_1 = __webpack_require__(/*! @hyperapp/router */ \"../../node_modules/@hyperapp/router/src/index.js\");\nconst About = () => (state, actions) => ((0, hyperapp_1.h)(\"div\", null,\n    (0, hyperapp_1.h)(\"h1\", null, \"About\"),\n    (0, hyperapp_1.h)(\"div\", null,\n        (0, hyperapp_1.h)(router_1.Link, { to: \"/\" }, \"Home\"))));\nexports.About = About;\n\n\n//# sourceURL=webpack://client/./src/components/about.tsx?");

/***/ }),

/***/ "./src/components/home.tsx":
/*!*********************************!*\
  !*** ./src/components/home.tsx ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.Home = void 0;\nconst hyperapp_1 = __webpack_require__(/*! hyperapp */ \"../../node_modules/hyperapp/src/index.js\");\nconst router_1 = __webpack_require__(/*! @hyperapp/router */ \"../../node_modules/@hyperapp/router/src/index.js\");\nconst Home = () => (state, actions) => ((0, hyperapp_1.h)(\"div\", null,\n    (0, hyperapp_1.h)(\"h1\", null, state.count),\n    (0, hyperapp_1.h)(\"button\", { onclick: () => actions.down(1) }, \"-\"),\n    (0, hyperapp_1.h)(\"button\", { onclick: () => actions.up(1) }, \"+\"),\n    (0, hyperapp_1.h)(\"div\", null,\n        (0, hyperapp_1.h)(router_1.Link, { to: \"/about\" }, \"About\"))));\nexports.Home = Home;\n\n\n//# sourceURL=webpack://client/./src/components/home.tsx?");

/***/ }),

/***/ "./src/components/index.ts":
/*!*********************************!*\
  !*** ./src/components/index.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.Components = void 0;\nconst home_1 = __webpack_require__(/*! ./home */ \"./src/components/home.tsx\");\nconst about_1 = __webpack_require__(/*! ./about */ \"./src/components/about.tsx\");\nexports.Components = {\n    Home: home_1.Home,\n    About: about_1.About\n};\n\n\n//# sourceURL=webpack://client/./src/components/index.ts?");

/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst hyperapp_1 = __webpack_require__(/*! hyperapp */ \"../../node_modules/hyperapp/src/index.js\");\nconst router_1 = __webpack_require__(/*! @hyperapp/router */ \"../../node_modules/@hyperapp/router/src/index.js\");\nconst modules_1 = __webpack_require__(/*! ./modules */ \"./src/modules/index.ts\");\nconst root_1 = __webpack_require__(/*! ./root */ \"./src/root.tsx\");\nlet main;\nif (true) {\n    main = (__webpack_require__(/*! @hyperapp/logger */ \"../../node_modules/@hyperapp/logger/src/index.js\").withLogger)(hyperapp_1.app)(modules_1.Modules.state, modules_1.Modules.actions, root_1.view, document.getElementById('app'));\n}\nelse {}\nconst unsubscribe = router_1.location.subscribe(main.location);\n\n\n//# sourceURL=webpack://client/./src/index.ts?");

/***/ }),

/***/ "./src/modules/counter.ts":
/*!********************************!*\
  !*** ./src/modules/counter.ts ***!
  \********************************/
/***/ (function(__unused_webpack_module, exports) {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.Counter = void 0;\nvar Counter;\n(function (Counter) {\n    Counter.state = {\n        count: 0\n    };\n    Counter.actions = {\n        down: (value) => (state) => ({ count: state.count - value }),\n        up: (value) => (state) => ({ count: state.count + value })\n    };\n})(Counter = exports.Counter || (exports.Counter = {}));\n\n\n//# sourceURL=webpack://client/./src/modules/counter.ts?");

/***/ }),

/***/ "./src/modules/index.ts":
/*!******************************!*\
  !*** ./src/modules/index.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.Modules = void 0;\nconst counter_1 = __webpack_require__(/*! ./counter */ \"./src/modules/counter.ts\");\nconst locator_1 = __webpack_require__(/*! ./locator */ \"./src/modules/locator.ts\");\nvar Modules;\n(function (Modules) {\n    Modules.state = Object.assign(Object.assign({}, counter_1.Counter.state), locator_1.Locator.state);\n    Modules.actions = Object.assign(Object.assign({}, counter_1.Counter.actions), locator_1.Locator.actions);\n})(Modules = exports.Modules || (exports.Modules = {}));\n\n\n//# sourceURL=webpack://client/./src/modules/index.ts?");

/***/ }),

/***/ "./src/modules/locator.ts":
/*!********************************!*\
  !*** ./src/modules/locator.ts ***!
  \********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.Locator = void 0;\nconst router_1 = __webpack_require__(/*! @hyperapp/router */ \"../../node_modules/@hyperapp/router/src/index.js\");\nvar Locator;\n(function (Locator) {\n    Locator.state = {\n        location: router_1.location.state\n    };\n    Locator.actions = {\n        location: router_1.location.actions\n    };\n})(Locator = exports.Locator || (exports.Locator = {}));\n\n\n//# sourceURL=webpack://client/./src/modules/locator.ts?");

/***/ }),

/***/ "./src/root.tsx":
/*!**********************!*\
  !*** ./src/root.tsx ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.view = void 0;\nconst hyperapp_1 = __webpack_require__(/*! hyperapp */ \"../../node_modules/hyperapp/src/index.js\");\nconst router_1 = __webpack_require__(/*! @hyperapp/router */ \"../../node_modules/@hyperapp/router/src/index.js\");\nconst components_1 = __webpack_require__(/*! ./components */ \"./src/components/index.ts\");\nconst view = () => ((0, hyperapp_1.h)(router_1.Switch, null,\n    (0, hyperapp_1.h)(router_1.Route, { path: \"/\", render: components_1.Components.Home }),\n    (0, hyperapp_1.h)(router_1.Route, { path: \"/about\", render: components_1.Components.About })));\nexports.view = view;\n\n\n//# sourceURL=webpack://client/./src/root.tsx?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.ts");
/******/ 	
/******/ })()
;