/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  testPathIgnorePatterns: ['/node_modules/', '/.expo/', '/dist/'],
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
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|moti|@react-native-async-storage)/)',
  ],
};
