import type { Config } from '@jest/types';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const config: Config.InitialOptions = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup/test-setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^react-markdown$': '<rootDir>/tests/setup/react-markdown-mock.tsx',
    '^rehype-slug$': '<rootDir>/tests/setup/rehype-plugin-mock.ts',
    '^rehype-autolink-headings$': '<rootDir>/tests/setup/rehype-plugin-mock.ts',
    '^remark-gfm$': '<rootDir>/tests/setup/rehype-plugin-mock.ts',
  },
  transformIgnorePatterns: [
    // Transform ESM packages used in components
    'node_modules/(?!(react-markdown|remark-gfm|rehype-slug|rehype-autolink-headings)/)'
  ],
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.test.tsx',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
