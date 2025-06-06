/*
 * Copyright (c) 2025 Arm Limited. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['src'],
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', // fixes path issues from ESM `.js` imports
  },
  watchPathIgnorePatterns: ["./dist/", "./generated/"],
  reporters: [
    "default",
    [ "jest-junit", { "outputDirectory": "./reports/junit", "outputName": "testreport.xml" } ]
  ]
};
