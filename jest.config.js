module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src/product-service/tests', '<rootDir>/src/import-service/tests'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^/opt/handlers-utils$': '<rootDir>/src/utils/handlers-utils',
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
