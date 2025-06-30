require("dotenv/config");

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node", // or "jsdom" if you use React Testing Library
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  rootDir: ".",
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/jest.setup.ts"],
  collectCoverage: true, // <--- add this line
  coverageReporters: ["lcov", "text"], // <--- add this line
  coverageDirectory: "coverage", // <--- optional, default is "coverage"
};