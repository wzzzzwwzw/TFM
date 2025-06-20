const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    "^server-only$": "<rootDir>/__mocks__/server-only.js",
    "^@/(.*)$": "<rootDir>/src/$1", // <-- This lets you use @/ imports in tests
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  },
};