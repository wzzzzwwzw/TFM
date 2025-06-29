require('dotenv/config');

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",  // changed to jsdom for React Testing Library
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  rootDir: ".",
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/jest.setup.ts"], // <--- add this line
};
