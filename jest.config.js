module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src/tests'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^/opt/handlers-utils$': '<rootDir>/src/utils/handlers-utils',
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
