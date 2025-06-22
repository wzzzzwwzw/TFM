const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  // Use jsdom for React component tests
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest", // Add this line for JSX/TSX support
  },
  moduleNameMapper: {
    "^server-only$": "<rootDir>/__mocks__/server-only.js",
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"], // Add tsx/jsx
  collectCoverageFrom: [
    "src/lib/**/*.ts",
    "!src/lib/**/*.d.ts",
  ],
  coverageDirectory: "coverage",
  setupFiles: ["<rootDir>/jest.setup.js"],
  transformIgnorePatterns: [
  "/node_modules/(?!jose|openid-client|next-auth).+\\.js$"
],
};