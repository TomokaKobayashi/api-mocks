"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFunction = exports.loadScripts = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
;
const modifiers = {
    baseDir: './',
    modules: {}
};
const findJs = (dir) => {
    const ret = [];
    const d = fs_1.default.readdirSync(dir);
    for (const f of d) {
        const p = path_1.default.resolve(dir, f);
        const s = fs_1.default.statSync(p);
        if (s.isDirectory()) {
            ret.push(...findJs(p));
        }
        if (f.endsWith('.js')) {
            ret.push(p);
        }
    }
    return ret;
};
const loadDynamic = (dir, name) => {
    const relName = path_1.default.relative(dir, name);
    const stat = fs_1.default.statSync(name);
    const key = require.resolve(name);
    const def = require(name);
    return {
        name: relName,
        fullName: name,
        timeStamp: stat.mtime.getTime(),
        key,
        module: def
    };
};
const loadScripts = (dirName) => {
    modifiers.baseDir = dirName;
    const scripts = findJs(dirName);
    for (const s of scripts) {
        const module = loadDynamic(dirName, s);
        if (module) {
            modifiers.modules[module.name] = module;
        }
    }
};
exports.loadScripts = loadScripts;
const getFunctionInner = (moduleName, funcName) => {
    const mod = modifiers.modules[moduleName];
    if (mod) {
        const stat = fs_1.default.statSync(mod.fullName);
        if (stat.mtime.getTime() != mod.timeStamp) {
            // script is modified
            if (require.cache[mod.key])
                delete require.cache[mod.key];
            const mod2 = loadDynamic(modifiers.baseDir, mod.fullName);
            if (mod2) {
                modifiers.modules[moduleName] = mod2;
                return mod2.module[funcName];
            }
            else {
                return undefined;
            }
        }
        return mod.module[funcName];
    }
    return undefined;
};
const getFunction = (name) => {
    const period = name.indexOf(':');
    if (period < 0)
        return undefined;
    const mod = name.substring(0, period);
    const fnc = name.substring(period + 1);
    return getFunctionInner(mod, fnc);
};
exports.getFunction = getFunction;
