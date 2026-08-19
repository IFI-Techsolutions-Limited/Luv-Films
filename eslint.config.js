// ESLint flat configuration (ESLint 9+) for the Luv Films application.
//
// The rule set is the eslint:recommended baseline, listed explicitly so that
// this file has no module dependencies of its own and can be run with either a
// locally installed ESLint or `npx eslint`.
//
// Usage:
//   npm run lint        # report problems
//   npm run lint:fix    # auto-fix what can be fixed
"use strict";

module.exports = [
  {
    // Never linted: vendored assets, build output and dependencies.
    ignores: [
      "node_modules/**",
      "assets/**",
      "staging/**",
      "coverage/**",
      "**/*.min.js",
    ],
  },

  {
    files: ["**/*.js"],

    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        // Node.js runtime globals
        require: "readonly",
        module: "writable",
        exports: "writable",
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",
        global: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        TextEncoder: "readonly",
        TextDecoder: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        setImmediate: "readonly",
        clearImmediate: "readonly",
        queueMicrotask: "readonly",
        structuredClone: "readonly",
      },
    },

    linterOptions: {
      reportUnusedDisableDirectives: "warn",
    },

    rules: {
      //------------ eslint:recommended baseline ------------//
      "constructor-super": "error",
      "for-direction": "error",
      "getter-return": "error",
      "no-async-promise-executor": "error",
      "no-case-declarations": "error",
      "no-class-assign": "error",
      "no-compare-neg-zero": "error",
      "no-cond-assign": "error",
      "no-const-assign": "error",
      "no-constant-binary-expression": "error",
      "no-constant-condition": "error",
      "no-control-regex": "error",
      "no-debugger": "error",
      "no-delete-var": "error",
      "no-dupe-args": "error",
      "no-dupe-class-members": "error",
      "no-dupe-else-if": "error",
      "no-dupe-keys": "error",
      "no-duplicate-case": "error",
      "no-empty": "error",
      "no-empty-character-class": "error",
      "no-empty-pattern": "error",
      "no-empty-static-block": "error",
      "no-ex-assign": "error",
      "no-extra-boolean-cast": "error",
      "no-fallthrough": "error",
      "no-func-assign": "error",
      "no-global-assign": "error",
      "no-import-assign": "error",
      "no-invalid-regexp": "error",
      "no-irregular-whitespace": "error",
      "no-loss-of-precision": "error",
      "no-misleading-character-class": "error",
      "no-new-native-nonconstructor": "error",
      "no-nonoctal-decimal-escape": "error",
      "no-obj-calls": "error",
      "no-octal": "error",
      "no-prototype-builtins": "error",
      "no-redeclare": "error",
      "no-regex-spaces": "error",
      "no-self-assign": "error",
      "no-setter-return": "error",
      "no-shadow-restricted-names": "error",
      "no-sparse-arrays": "error",
      "no-this-before-super": "error",
      "no-undef": "error",
      "no-unexpected-multiline": "error",
      "no-unreachable": "error",
      "no-unsafe-finally": "error",
      "no-unsafe-negation": "error",
      "no-unsafe-optional-chaining": "error",
      "no-unused-labels": "error",
      "no-unused-private-class-members": "error",
      "no-useless-backreference": "error",
      "no-useless-catch": "error",
      "no-useless-escape": "error",
      "no-with": "error",
      "require-yield": "error",
      "use-isnan": "error",
      "valid-typeof": "error",

      //------------ Project adjustments ------------//
      // Express handlers are declared as (req, res, next) even when a
      // parameter is unused, so unused arguments are not reported.
      "no-unused-vars": ["error", { args: "none", caughtErrors: "none" }],

      // Style guidance kept as warnings so they do not fail the build.
      "no-var": "warn",
      "prefer-const": "warn",
      eqeqeq: ["warn", "smart"],
      "no-console": "off",
    },
  },
];
