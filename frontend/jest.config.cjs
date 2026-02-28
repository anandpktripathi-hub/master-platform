module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  testMatch: ['<rootDir>/src/**/*.test.(ts|tsx|js|jsx)', '<rootDir>/src/**/*.spec.(ts|tsx|js|jsx)'],
  testPathIgnorePatterns: ['<rootDir>/tests/'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/src/__mocks__/styleMock.cjs',
  },
};
