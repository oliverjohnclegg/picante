/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  testPathIgnorePatterns: ['/node_modules/', '/.expo/', '/dist/'],
  clearMocks: true,
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/app/$1',
    '^@game/(.*)$': '<rootDir>/src/game/$1',
    '^@content/(.*)$': '<rootDir>/src/content/$1',
    '^@ui/(.*)$': '<rootDir>/src/ui/$1',
    '^@platform/(.*)$': '<rootDir>/src/platform/$1',
    '^@i18n/(.*)$': '<rootDir>/src/i18n/$1',
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(m4a|mp3|wav|ogg|png|jpg|jpeg|svg)$': '<rootDir>/src/__mocks__/assetMock.js',
  },
  collectCoverageFrom: [
    'src/game/**/*.ts',
    'src/content/**/*.ts',
    'src/platform/**/*.ts',
    'src/i18n/**/*.ts',
    'src/ui/theme.ts',
    'src/ui/components/modalDefaults.ts',
    'src/ui/useFonts.ts',
    '!**/*.d.ts',
    '!**/__tests__/**',
  ],
  coverageReporters: ['text', 'lcov', 'cobertura'],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 82,
      functions: 90,
      lines: 90,
    },
  },
};
