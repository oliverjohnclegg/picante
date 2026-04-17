/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  testPathIgnorePatterns: ['/node_modules/', '/.expo/', '/dist/'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },
  moduleNameMapper: {
    '^@game/(.*)$': '<rootDir>/src/game/$1',
    '^@content/(.*)$': '<rootDir>/src/content/$1',
    '^@ui/(.*)$': '<rootDir>/src/ui/$1',
    '^@platform/(.*)$': '<rootDir>/src/platform/$1',
    '^@i18n/(.*)$': '<rootDir>/src/i18n/$1',
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'src/game/**/*.ts',
    'src/content/**/*.ts',
    '!**/*.d.ts',
    '!**/__tests__/**',
  ],
};
