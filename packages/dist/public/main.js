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

/***/ "./src/scss/styles.scss":
/*!******************************!*\
  !*** ./src/scss/styles.scss ***!
  \******************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://client/./src/scss/styles.scss?");

/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst hyperapp_1 = __webpack_require__(/*! hyperapp */ \"../../node_modules/hyperapp/index.js\");\nconst modules_1 = __webpack_require__(/*! ./modules */ \"./src/modules/index.ts\");\nconst root_1 = __webpack_require__(/*! ./root */ \"./src/root.ts\");\n__webpack_require__(/*! ./styles */ \"./src/styles.ts\");\nconst node = document.getElementById('app');\nif (node) {\n    const main = (0, hyperapp_1.app)({ init: modules_1.Modules.state, view: root_1.view, node });\n}\n\n\n//# sourceURL=webpack://client/./src/index.ts?");

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

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.Modules = void 0;\nconst counter_1 = __webpack_require__(/*! ./counter */ \"./src/modules/counter.ts\");\nvar Modules;\n(function (Modules) {\n    Modules.state = Object.assign({}, counter_1.Counter.state);\n    Modules.actions = Object.assign({}, counter_1.Counter.actions);\n})(Modules = exports.Modules || (exports.Modules = {}));\n\n\n//# sourceURL=webpack://client/./src/modules/index.ts?");

/***/ }),

/***/ "./src/pages/index.ts":
/*!****************************!*\
  !*** ./src/pages/index.ts ***!
  \****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.MainPage = void 0;\nconst hyperapp_1 = __webpack_require__(/*! hyperapp */ \"../../node_modules/hyperapp/index.js\");\nconst MainPage = () => {\n    return (0, hyperapp_1.h)(\"h1\", {}, (0, hyperapp_1.text)('MainPage worked'));\n};\nexports.MainPage = MainPage;\n\n\n//# sourceURL=webpack://client/./src/pages/index.ts?");

/***/ }),

/***/ "./src/root.ts":
/*!*********************!*\
  !*** ./src/root.ts ***!
  \*********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.view = void 0;\n//import { Components } from './components'\nconst index_1 = __webpack_require__(/*! ./pages/index */ \"./src/pages/index.ts\");\nexports.view = index_1.MainPage;\n\n\n//# sourceURL=webpack://client/./src/root.ts?");

/***/ }),

/***/ "./src/styles.ts":
/*!***********************!*\
  !*** ./src/styles.ts ***!
  \***********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nvar __importDefault = (this && this.__importDefault) || function (mod) {\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst styles_scss_1 = __importDefault(__webpack_require__(/*! ./scss/styles.scss */ \"./src/scss/styles.scss\"));\nexports[\"default\"] = styles_scss_1.default;\n\n\n//# sourceURL=webpack://client/./src/styles.ts?");

/***/ }),

/***/ "../../node_modules/hyperapp/index.js":
/*!********************************************!*\
  !*** ../../node_modules/hyperapp/index.js ***!
  \********************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"memo\": function() { return /* binding */ memo; },\n/* harmony export */   \"text\": function() { return /* binding */ text; },\n/* harmony export */   \"h\": function() { return /* binding */ h; },\n/* harmony export */   \"app\": function() { return /* binding */ app; }\n/* harmony export */ });\nvar SSR_NODE = 1\nvar TEXT_NODE = 3\nvar EMPTY_OBJ = {}\nvar EMPTY_ARR = []\nvar SVG_NS = \"http://www.w3.org/2000/svg\"\n\nvar id = (a) => a\nvar map = EMPTY_ARR.map\nvar isArray = Array.isArray\nvar enqueue =\n  typeof requestAnimationFrame !== \"undefined\"\n    ? requestAnimationFrame\n    : setTimeout\n\nvar createClass = (obj) => {\n  var out = \"\"\n\n  if (typeof obj === \"string\") return obj\n\n  if (isArray(obj)) {\n    for (var k = 0, tmp; k < obj.length; k++) {\n      if ((tmp = createClass(obj[k]))) {\n        out += (out && \" \") + tmp\n      }\n    }\n  } else {\n    for (var k in obj) {\n      if (obj[k]) out += (out && \" \") + k\n    }\n  }\n\n  return out\n}\n\nvar shouldRestart = (a, b) => {\n  for (var k in { ...a, ...b }) {\n    if (typeof (isArray(a[k]) ? a[k][0] : a[k]) === \"function\") {\n      b[k] = a[k]\n    } else if (a[k] !== b[k]) return true\n  }\n}\n\nvar patchSubs = (oldSubs, newSubs = EMPTY_ARR, dispatch) => {\n  for (\n    var subs = [], i = 0, oldSub, newSub;\n    i < oldSubs.length || i < newSubs.length;\n    i++\n  ) {\n    oldSub = oldSubs[i]\n    newSub = newSubs[i]\n\n    subs.push(\n      newSub && newSub !== true\n        ? !oldSub ||\n          newSub[0] !== oldSub[0] ||\n          shouldRestart(newSub[1], oldSub[1])\n          ? [\n              newSub[0],\n              newSub[1],\n              (oldSub && oldSub[2](), newSub[0](dispatch, newSub[1])),\n            ]\n          : oldSub\n        : oldSub && oldSub[2]()\n    )\n  }\n  return subs\n}\n\nvar getKey = (vdom) => (vdom == null ? vdom : vdom.key)\n\nvar patchProperty = (node, key, oldValue, newValue, listener, isSvg) => {\n  if (key === \"key\") {\n  } else if (key === \"style\") {\n    for (var k in { ...oldValue, ...newValue }) {\n      oldValue = newValue == null || newValue[k] == null ? \"\" : newValue[k]\n      if (k[0] === \"-\") {\n        node[key].setProperty(k, oldValue)\n      } else {\n        node[key][k] = oldValue\n      }\n    }\n  } else if (key[0] === \"o\" && key[1] === \"n\") {\n    if (\n      !((node.events || (node.events = {}))[(key = key.slice(2))] = newValue)\n    ) {\n      node.removeEventListener(key, listener)\n    } else if (!oldValue) {\n      node.addEventListener(key, listener)\n    }\n  } else if (!isSvg && key !== \"list\" && key !== \"form\" && key in node) {\n    node[key] = newValue == null ? \"\" : newValue\n  } else if (\n    newValue == null ||\n    newValue === false ||\n    (key === \"class\" && !(newValue = createClass(newValue)))\n  ) {\n    node.removeAttribute(key)\n  } else {\n    node.setAttribute(key, newValue)\n  }\n}\n\nvar createNode = (vdom, listener, isSvg) => {\n  var props = vdom.props\n  var node =\n    vdom.type === TEXT_NODE\n      ? document.createTextNode(vdom.tag)\n      : (isSvg = isSvg || vdom.tag === \"svg\")\n      ? document.createElementNS(SVG_NS, vdom.tag, props.is && props)\n      : document.createElement(vdom.tag, props.is && props)\n\n  for (var k in props) {\n    patchProperty(node, k, null, props[k], listener, isSvg)\n  }\n\n  for (var i = 0; i < vdom.children.length; i++) {\n    node.appendChild(\n      createNode(\n        (vdom.children[i] = maybeVNode(vdom.children[i])),\n        listener,\n        isSvg\n      )\n    )\n  }\n\n  return (vdom.node = node)\n}\n\nvar patch = (parent, node, oldVNode, newVNode, listener, isSvg) => {\n  if (oldVNode === newVNode) {\n  } else if (\n    oldVNode != null &&\n    oldVNode.type === TEXT_NODE &&\n    newVNode.type === TEXT_NODE\n  ) {\n    if (oldVNode.tag !== newVNode.tag) node.nodeValue = newVNode.tag\n  } else if (oldVNode == null || oldVNode.tag !== newVNode.tag) {\n    node = parent.insertBefore(\n      createNode((newVNode = maybeVNode(newVNode)), listener, isSvg),\n      node\n    )\n    if (oldVNode != null) {\n      parent.removeChild(oldVNode.node)\n    }\n  } else {\n    var tmpVKid\n    var oldVKid\n\n    var oldKey\n    var newKey\n\n    var oldProps = oldVNode.props\n    var newProps = newVNode.props\n\n    var oldVKids = oldVNode.children\n    var newVKids = newVNode.children\n\n    var oldHead = 0\n    var newHead = 0\n    var oldTail = oldVKids.length - 1\n    var newTail = newVKids.length - 1\n\n    isSvg = isSvg || newVNode.tag === \"svg\"\n\n    for (var i in { ...oldProps, ...newProps }) {\n      if (\n        (i === \"value\" || i === \"selected\" || i === \"checked\"\n          ? node[i]\n          : oldProps[i]) !== newProps[i]\n      ) {\n        patchProperty(node, i, oldProps[i], newProps[i], listener, isSvg)\n      }\n    }\n\n    while (newHead <= newTail && oldHead <= oldTail) {\n      if (\n        (oldKey = getKey(oldVKids[oldHead])) == null ||\n        oldKey !== getKey(newVKids[newHead])\n      ) {\n        break\n      }\n\n      patch(\n        node,\n        oldVKids[oldHead].node,\n        oldVKids[oldHead],\n        (newVKids[newHead] = maybeVNode(\n          newVKids[newHead++],\n          oldVKids[oldHead++]\n        )),\n        listener,\n        isSvg\n      )\n    }\n\n    while (newHead <= newTail && oldHead <= oldTail) {\n      if (\n        (oldKey = getKey(oldVKids[oldTail])) == null ||\n        oldKey !== getKey(newVKids[newTail])\n      ) {\n        break\n      }\n\n      patch(\n        node,\n        oldVKids[oldTail].node,\n        oldVKids[oldTail],\n        (newVKids[newTail] = maybeVNode(\n          newVKids[newTail--],\n          oldVKids[oldTail--]\n        )),\n        listener,\n        isSvg\n      )\n    }\n\n    if (oldHead > oldTail) {\n      while (newHead <= newTail) {\n        node.insertBefore(\n          createNode(\n            (newVKids[newHead] = maybeVNode(newVKids[newHead++])),\n            listener,\n            isSvg\n          ),\n          (oldVKid = oldVKids[oldHead]) && oldVKid.node\n        )\n      }\n    } else if (newHead > newTail) {\n      while (oldHead <= oldTail) {\n        node.removeChild(oldVKids[oldHead++].node)\n      }\n    } else {\n      for (var keyed = {}, newKeyed = {}, i = oldHead; i <= oldTail; i++) {\n        if ((oldKey = oldVKids[i].key) != null) {\n          keyed[oldKey] = oldVKids[i]\n        }\n      }\n\n      while (newHead <= newTail) {\n        oldKey = getKey((oldVKid = oldVKids[oldHead]))\n        newKey = getKey(\n          (newVKids[newHead] = maybeVNode(newVKids[newHead], oldVKid))\n        )\n\n        if (\n          newKeyed[oldKey] ||\n          (newKey != null && newKey === getKey(oldVKids[oldHead + 1]))\n        ) {\n          if (oldKey == null) {\n            node.removeChild(oldVKid.node)\n          }\n          oldHead++\n          continue\n        }\n\n        if (newKey == null || oldVNode.type === SSR_NODE) {\n          if (oldKey == null) {\n            patch(\n              node,\n              oldVKid && oldVKid.node,\n              oldVKid,\n              newVKids[newHead],\n              listener,\n              isSvg\n            )\n            newHead++\n          }\n          oldHead++\n        } else {\n          if (oldKey === newKey) {\n            patch(\n              node,\n              oldVKid.node,\n              oldVKid,\n              newVKids[newHead],\n              listener,\n              isSvg\n            )\n            newKeyed[newKey] = true\n            oldHead++\n          } else {\n            if ((tmpVKid = keyed[newKey]) != null) {\n              patch(\n                node,\n                node.insertBefore(tmpVKid.node, oldVKid && oldVKid.node),\n                tmpVKid,\n                newVKids[newHead],\n                listener,\n                isSvg\n              )\n              newKeyed[newKey] = true\n            } else {\n              patch(\n                node,\n                oldVKid && oldVKid.node,\n                null,\n                newVKids[newHead],\n                listener,\n                isSvg\n              )\n            }\n          }\n          newHead++\n        }\n      }\n\n      while (oldHead <= oldTail) {\n        if (getKey((oldVKid = oldVKids[oldHead++])) == null) {\n          node.removeChild(oldVKid.node)\n        }\n      }\n\n      for (var i in keyed) {\n        if (newKeyed[i] == null) {\n          node.removeChild(keyed[i].node)\n        }\n      }\n    }\n  }\n\n  return (newVNode.node = node)\n}\n\nvar propsChanged = (a, b) => {\n  for (var k in a) if (a[k] !== b[k]) return true\n  for (var k in b) if (a[k] !== b[k]) return true\n}\n\nvar maybeVNode = (newVNode, oldVNode) =>\n  newVNode !== true && newVNode !== false && newVNode\n    ? typeof newVNode.tag === \"function\"\n      ? ((!oldVNode ||\n          oldVNode.memo == null ||\n          propsChanged(oldVNode.memo, newVNode.memo)) &&\n          ((oldVNode = newVNode.tag(newVNode.memo)).memo = newVNode.memo),\n        oldVNode)\n      : newVNode\n    : text(\"\")\n\nvar recycleNode = (node) =>\n  node.nodeType === TEXT_NODE\n    ? text(node.nodeValue, node)\n    : createVNode(\n        node.nodeName.toLowerCase(),\n        EMPTY_OBJ,\n        map.call(node.childNodes, recycleNode),\n        SSR_NODE,\n        node\n      )\n\nvar createVNode = (tag, props, children, type, node) => ({\n  tag,\n  props,\n  key: props.key,\n  children,\n  type,\n  node,\n})\n\nvar memo = (tag, memo) => ({ tag, memo })\n\nvar text = (value, node) =>\n  createVNode(value, EMPTY_OBJ, EMPTY_ARR, TEXT_NODE, node)\n\nvar h = (tag, props, children = EMPTY_ARR) =>\n  createVNode(tag, props, isArray(children) ? children : [children])\n\nvar app = ({\n  node,\n  view,\n  subscriptions,\n  dispatch = id,\n  init = EMPTY_OBJ,\n}) => {\n  var vdom = node && recycleNode(node)\n  var subs = []\n  var state\n  var busy\n\n  var update = (newState) => {\n    if (state !== newState) {\n      if ((state = newState) == null) dispatch = subscriptions = render = id\n      if (subscriptions) subs = patchSubs(subs, subscriptions(state), dispatch)\n      if (view && !busy) enqueue(render, (busy = true))\n    }\n  }\n\n  var render = () =>\n    (node = patch(\n      node.parentNode,\n      node,\n      vdom,\n      (vdom = view(state)),\n      listener,\n      (busy = false)\n    ))\n\n  var listener = function (event) {\n    dispatch(this.events[event.type], event)\n  }\n\n  return (\n    (dispatch = dispatch((action, props) =>\n      typeof action === \"function\"\n        ? dispatch(action(state, props))\n        : isArray(action)\n        ? typeof action[0] === \"function\"\n          ? dispatch(action[0], action[1])\n          : action\n              .slice(1)\n              .map(\n                (fx) => fx && fx !== true && fx[0](dispatch, fx[1]),\n                update(action[0])\n              )\n        : update(action)\n    ))(init),\n    dispatch\n  )\n}\n\n\n//# sourceURL=webpack://client/../../node_modules/hyperapp/index.js?");

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
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
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