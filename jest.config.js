module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src/tests'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^/opt/mock-data$': '<rootDir>/src/mocks/mock-data',
    '^/opt/response-utils$': '<rootDir>/src/utils/response-utils',
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
