export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.mjs'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^next/server$': 'next/server.js',
  },
  transform: {},
};
