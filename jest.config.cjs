/** @type {import('jest').Config} */
module.exports = {
  testMatch: ['<rootDir>/src/**/__tests__/**/*.ts?(x)', '<rootDir>/@(test|src)/**/*(*.)@(spec|test).ts?(x)'],
  clearMocks: true,
  collectCoverage: true,
  passWithNoTests: true,
  coverageProvider: 'v8',
  coverageReporters: ['json', 'lcov', 'clover', 'cobertura', 'text'],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testPathIgnorePatterns: ['/node_modules/'],
  watchPathIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/test-reports',
      },
    ],
  ],
  transform: {
    '^.+\\.[t]sx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.dev.json',
        useESM: true,
      },
    ],
  },
};
