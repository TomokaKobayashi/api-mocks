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

/***/ "./src/components/about.ts":
/*!*********************************!*\
  !*** ./src/components/about.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.About = void 0;\nconst hyperapp_1 = __webpack_require__(/*! hyperapp */ \"../../node_modules/hyperapp/index.js\");\nconst About = () => (state, actions) => {\n    return (0, hyperapp_1.h)('div', {}, [\n        (0, hyperapp_1.h)('h1', {}, (0, hyperapp_1.text)('About')),\n    ]);\n};\nexports.About = About;\n\n\n//# sourceURL=webpack://client/./src/components/about.ts?");

/***/ }),

/***/ "./src/components/home.ts":
/*!********************************!*\
  !*** ./src/components/home.ts ***!
  \********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.Home = void 0;\nconst hyperapp_1 = __webpack_require__(/*! hyperapp */ \"../../node_modules/hyperapp/index.js\");\nconst modules_1 = __webpack_require__(/*! ../modules */ \"./src/modules/index.ts\");\nconst { div, h1, button } = __webpack_require__(/*! @hyperapp/html */ \"../../node_modules/@hyperapp/html/index.js\");\nconst Home = () => (state) => {\n    return div({}, [\n        h1({}, (0, hyperapp_1.text)(state.count)),\n        button({ onclick: () => modules_1.Modules.actions.down(1) }, (0, hyperapp_1.text)('-')),\n        button({ onclick: () => modules_1.Modules.actions.up(1) }, (0, hyperapp_1.text)('+'))\n    ]);\n};\nexports.Home = Home;\n\n\n//# sourceURL=webpack://client/./src/components/home.ts?");

/***/ }),

/***/ "./src/components/index.ts":
/*!*********************************!*\
  !*** ./src/components/index.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.Components = void 0;\nconst home_1 = __webpack_require__(/*! ./home */ \"./src/components/home.ts\");\nconst about_1 = __webpack_require__(/*! ./about */ \"./src/components/about.ts\");\nexports.Components = {\n    Home: home_1.Home,\n    About: about_1.About\n};\n\n\n//# sourceURL=webpack://client/./src/components/index.ts?");

/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst hyperapp_1 = __webpack_require__(/*! hyperapp */ \"../../node_modules/hyperapp/index.js\");\nconst modules_1 = __webpack_require__(/*! ./modules */ \"./src/modules/index.ts\");\nconst root_1 = __webpack_require__(/*! ./root */ \"./src/root.ts\");\nconst node = document.getElementById('app');\nif (node) {\n    const main = (0, hyperapp_1.app)({ init: modules_1.Modules.state, view: root_1.view, node });\n}\n\n\n//# sourceURL=webpack://client/./src/index.ts?");

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

/***/ "./src/root.ts":
/*!*********************!*\
  !*** ./src/root.ts ***!
  \*********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.view = void 0;\nconst components_1 = __webpack_require__(/*! ./components */ \"./src/components/index.ts\");\nexports.view = components_1.Components.Home();\n\n\n//# sourceURL=webpack://client/./src/root.ts?");

/***/ }),

/***/ "../../node_modules/@hyperapp/html/index.js":
/*!**************************************************!*\
  !*** ../../node_modules/@hyperapp/html/index.js ***!
  \**************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"a\": function() { return /* binding */ a; },\n/* harmony export */   \"b\": function() { return /* binding */ b; },\n/* harmony export */   \"i\": function() { return /* binding */ i; },\n/* harmony export */   \"p\": function() { return /* binding */ p; },\n/* harmony export */   \"q\": function() { return /* binding */ q; },\n/* harmony export */   \"s\": function() { return /* binding */ s; },\n/* harmony export */   \"br\": function() { return /* binding */ br; },\n/* harmony export */   \"dd\": function() { return /* binding */ dd; },\n/* harmony export */   \"dl\": function() { return /* binding */ dl; },\n/* harmony export */   \"dt\": function() { return /* binding */ dt; },\n/* harmony export */   \"em\": function() { return /* binding */ em; },\n/* harmony export */   \"h1\": function() { return /* binding */ h1; },\n/* harmony export */   \"h2\": function() { return /* binding */ h2; },\n/* harmony export */   \"h3\": function() { return /* binding */ h3; },\n/* harmony export */   \"h4\": function() { return /* binding */ h4; },\n/* harmony export */   \"h5\": function() { return /* binding */ h5; },\n/* harmony export */   \"h6\": function() { return /* binding */ h6; },\n/* harmony export */   \"hr\": function() { return /* binding */ hr; },\n/* harmony export */   \"li\": function() { return /* binding */ li; },\n/* harmony export */   \"ol\": function() { return /* binding */ ol; },\n/* harmony export */   \"rp\": function() { return /* binding */ rp; },\n/* harmony export */   \"rt\": function() { return /* binding */ rt; },\n/* harmony export */   \"td\": function() { return /* binding */ td; },\n/* harmony export */   \"th\": function() { return /* binding */ th; },\n/* harmony export */   \"tr\": function() { return /* binding */ tr; },\n/* harmony export */   \"ul\": function() { return /* binding */ ul; },\n/* harmony export */   \"bdi\": function() { return /* binding */ bdi; },\n/* harmony export */   \"bdo\": function() { return /* binding */ bdo; },\n/* harmony export */   \"col\": function() { return /* binding */ col; },\n/* harmony export */   \"del\": function() { return /* binding */ del; },\n/* harmony export */   \"dfn\": function() { return /* binding */ dfn; },\n/* harmony export */   \"div\": function() { return /* binding */ div; },\n/* harmony export */   \"img\": function() { return /* binding */ img; },\n/* harmony export */   \"ins\": function() { return /* binding */ ins; },\n/* harmony export */   \"kbd\": function() { return /* binding */ kbd; },\n/* harmony export */   \"map\": function() { return /* binding */ map; },\n/* harmony export */   \"nav\": function() { return /* binding */ nav; },\n/* harmony export */   \"pre\": function() { return /* binding */ pre; },\n/* harmony export */   \"rtc\": function() { return /* binding */ rtc; },\n/* harmony export */   \"sub\": function() { return /* binding */ sub; },\n/* harmony export */   \"sup\": function() { return /* binding */ sup; },\n/* harmony export */   \"wbr\": function() { return /* binding */ wbr; },\n/* harmony export */   \"abbr\": function() { return /* binding */ abbr; },\n/* harmony export */   \"area\": function() { return /* binding */ area; },\n/* harmony export */   \"cite\": function() { return /* binding */ cite; },\n/* harmony export */   \"code\": function() { return /* binding */ code; },\n/* harmony export */   \"data\": function() { return /* binding */ data; },\n/* harmony export */   \"form\": function() { return /* binding */ form; },\n/* harmony export */   \"main\": function() { return /* binding */ main; },\n/* harmony export */   \"mark\": function() { return /* binding */ mark; },\n/* harmony export */   \"ruby\": function() { return /* binding */ ruby; },\n/* harmony export */   \"samp\": function() { return /* binding */ samp; },\n/* harmony export */   \"span\": function() { return /* binding */ span; },\n/* harmony export */   \"time\": function() { return /* binding */ time; },\n/* harmony export */   \"aside\": function() { return /* binding */ aside; },\n/* harmony export */   \"audio\": function() { return /* binding */ audio; },\n/* harmony export */   \"input\": function() { return /* binding */ input; },\n/* harmony export */   \"label\": function() { return /* binding */ label; },\n/* harmony export */   \"meter\": function() { return /* binding */ meter; },\n/* harmony export */   \"param\": function() { return /* binding */ param; },\n/* harmony export */   \"small\": function() { return /* binding */ small; },\n/* harmony export */   \"table\": function() { return /* binding */ table; },\n/* harmony export */   \"tbody\": function() { return /* binding */ tbody; },\n/* harmony export */   \"tfoot\": function() { return /* binding */ tfoot; },\n/* harmony export */   \"thead\": function() { return /* binding */ thead; },\n/* harmony export */   \"track\": function() { return /* binding */ track; },\n/* harmony export */   \"video\": function() { return /* binding */ video; },\n/* harmony export */   \"button\": function() { return /* binding */ button; },\n/* harmony export */   \"canvas\": function() { return /* binding */ canvas; },\n/* harmony export */   \"dialog\": function() { return /* binding */ dialog; },\n/* harmony export */   \"figure\": function() { return /* binding */ figure; },\n/* harmony export */   \"footer\": function() { return /* binding */ footer; },\n/* harmony export */   \"header\": function() { return /* binding */ header; },\n/* harmony export */   \"iframe\": function() { return /* binding */ iframe; },\n/* harmony export */   \"legend\": function() { return /* binding */ legend; },\n/* harmony export */   \"object\": function() { return /* binding */ object; },\n/* harmony export */   \"option\": function() { return /* binding */ option; },\n/* harmony export */   \"output\": function() { return /* binding */ output; },\n/* harmony export */   \"select\": function() { return /* binding */ select; },\n/* harmony export */   \"source\": function() { return /* binding */ source; },\n/* harmony export */   \"strong\": function() { return /* binding */ strong; },\n/* harmony export */   \"address\": function() { return /* binding */ address; },\n/* harmony export */   \"article\": function() { return /* binding */ article; },\n/* harmony export */   \"caption\": function() { return /* binding */ caption; },\n/* harmony export */   \"details\": function() { return /* binding */ details; },\n/* harmony export */   \"section\": function() { return /* binding */ section; },\n/* harmony export */   \"summary\": function() { return /* binding */ summary; },\n/* harmony export */   \"picture\": function() { return /* binding */ picture; },\n/* harmony export */   \"colgroup\": function() { return /* binding */ colgroup; },\n/* harmony export */   \"datalist\": function() { return /* binding */ datalist; },\n/* harmony export */   \"fieldset\": function() { return /* binding */ fieldset; },\n/* harmony export */   \"menuitem\": function() { return /* binding */ menuitem; },\n/* harmony export */   \"optgroup\": function() { return /* binding */ optgroup; },\n/* harmony export */   \"progress\": function() { return /* binding */ progress; },\n/* harmony export */   \"textarea\": function() { return /* binding */ textarea; },\n/* harmony export */   \"blockquote\": function() { return /* binding */ blockquote; },\n/* harmony export */   \"figcaption\": function() { return /* binding */ figcaption; },\n/* harmony export */   \"text\": function() { return /* reexport safe */ hyperapp__WEBPACK_IMPORTED_MODULE_0__.text; }\n/* harmony export */ });\n/* harmony import */ var hyperapp__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! hyperapp */ \"../../node_modules/hyperapp/index.js\");\n\n\nconst EMPTY_ARR = []\nconst EMPTY_OBJ = {}\n\nconst tag = (tag) => (\n  props = EMPTY_OBJ,\n  children = props.tag != null || Array.isArray(props) ? props : EMPTY_ARR\n) => (0,hyperapp__WEBPACK_IMPORTED_MODULE_0__.h)(tag, props === children ? EMPTY_OBJ : props, children)\n\nconst a = tag(\"a\")\nconst b = tag(\"b\")\nconst i = tag(\"i\")\nconst p = tag(\"p\")\nconst q = tag(\"q\")\nconst s = tag(\"s\")\nconst br = tag(\"br\")\nconst dd = tag(\"dd\")\nconst dl = tag(\"dl\")\nconst dt = tag(\"dt\")\nconst em = tag(\"em\")\nconst h1 = tag(\"h1\")\nconst h2 = tag(\"h2\")\nconst h3 = tag(\"h3\")\nconst h4 = tag(\"h4\")\nconst h5 = tag(\"h5\")\nconst h6 = tag(\"h6\")\nconst hr = tag(\"hr\")\nconst li = tag(\"li\")\nconst ol = tag(\"ol\")\nconst rp = tag(\"rp\")\nconst rt = tag(\"rt\")\nconst td = tag(\"td\")\nconst th = tag(\"th\")\nconst tr = tag(\"tr\")\nconst ul = tag(\"ul\")\nconst bdi = tag(\"bdi\")\nconst bdo = tag(\"bdo\")\nconst col = tag(\"col\")\nconst del = tag(\"del\")\nconst dfn = tag(\"dfn\")\nconst div = tag(\"div\")\nconst img = tag(\"img\")\nconst ins = tag(\"ins\")\nconst kbd = tag(\"kbd\")\nconst map = tag(\"map\")\nconst nav = tag(\"nav\")\nconst pre = tag(\"pre\")\nconst rtc = tag(\"rtc\")\nconst sub = tag(\"sub\")\nconst sup = tag(\"sup\")\nconst wbr = tag(\"wbr\")\nconst abbr = tag(\"abbr\")\nconst area = tag(\"area\")\nconst cite = tag(\"cite\")\nconst code = tag(\"code\")\nconst data = tag(\"data\")\nconst form = tag(\"form\")\nconst main = tag(\"main\")\nconst mark = tag(\"mark\")\nconst ruby = tag(\"ruby\")\nconst samp = tag(\"samp\")\nconst span = tag(\"span\")\nconst time = tag(\"time\")\nconst aside = tag(\"aside\")\nconst audio = tag(\"audio\")\nconst input = tag(\"input\")\nconst label = tag(\"label\")\nconst meter = tag(\"meter\")\nconst param = tag(\"param\")\nconst small = tag(\"small\")\nconst table = tag(\"table\")\nconst tbody = tag(\"tbody\")\nconst tfoot = tag(\"tfoot\")\nconst thead = tag(\"thead\")\nconst track = tag(\"track\")\nconst video = tag(\"video\")\nconst button = tag(\"button\")\nconst canvas = tag(\"canvas\")\nconst dialog = tag(\"dialog\")\nconst figure = tag(\"figure\")\nconst footer = tag(\"footer\")\nconst header = tag(\"header\")\nconst iframe = tag(\"iframe\")\nconst legend = tag(\"legend\")\nconst object = tag(\"object\")\nconst option = tag(\"option\")\nconst output = tag(\"output\")\nconst select = tag(\"select\")\nconst source = tag(\"source\")\nconst strong = tag(\"strong\")\nconst address = tag(\"address\")\nconst article = tag(\"article\")\nconst caption = tag(\"caption\")\nconst details = tag(\"details\")\nconst section = tag(\"section\")\nconst summary = tag(\"summary\")\nconst picture = tag(\"picture\")\nconst colgroup = tag(\"colgroup\")\nconst datalist = tag(\"datalist\")\nconst fieldset = tag(\"fieldset\")\nconst menuitem = tag(\"menuitem\")\nconst optgroup = tag(\"optgroup\")\nconst progress = tag(\"progress\")\nconst textarea = tag(\"textarea\")\nconst blockquote = tag(\"blockquote\")\nconst figcaption = tag(\"figcaption\")\n\n\n\n//# sourceURL=webpack://client/../../node_modules/@hyperapp/html/index.js?");

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