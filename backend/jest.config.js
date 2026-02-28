module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.(spec|test|e2e-spec)\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: {
          types: ['jest', 'node'],
        },
      },
    ],
  },
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.dto.ts',
    '!src/**/*.schema.ts',
    '!src/**/*.interface.ts',
    '!src/main.ts',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  roots: ['<rootDir>/src/'],
};
