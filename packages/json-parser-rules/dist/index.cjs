"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  parseJsonByRules: () => parseJsonByRules
});
module.exports = __toCommonJS(src_exports);

// src/json-parser-rules.ts
function parseJsonByRules(source, options) {
  const compiledRules = compileRules(options.rules);
  const parser = options.parser ?? JSON.parse;
  return parser(source, (key, value, context) => {
    const { keys, source: source2 } = context;
    const path = keys.join(".");
    const reviver = findReviver(path);
    if (!reviver) {
      return value;
    }
    return reviver({
      value,
      source: source2,
      path
    });
  });
  function findReviver(path) {
    for (const [matcher, reviver] of compiledRules) {
      if (typeof matcher === "string") {
        if (matcher === path) {
          return reviver;
        }
      } else {
        if (matcher.test(path)) {
          return reviver;
        }
      }
    }
    return void 0;
  }
  function compileRules(rules) {
    const compiledRules2 = [];
    for (const rule of rules) {
      const patterns = Array.isArray(rule.pattern) ? rule.pattern : [rule.pattern];
      for (const pattern of patterns) {
        const matcher = compilePattern(pattern);
        compiledRules2.push([matcher, rule.reviver]);
      }
    }
    return compiledRules2;
  }
  function compilePattern(pattern) {
    let parts = [];
    let isRegExp = false;
    for (const token of pattern.split(".")) {
      if (token === "**") {
        parts.push(".*");
        isRegExp = true;
      } else if (token.includes("*")) {
        parts.push(token.replace(/\*/g, "[^\\.]*?"));
        isRegExp = true;
      } else {
        parts.push(token);
      }
    }
    if (isRegExp) {
      const rePattern = "^" + parts.join("\\.") + "$";
      return new RegExp(rePattern);
    } else {
      return pattern;
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  parseJsonByRules
});
//# sourceMappingURL=index.cjs.map
