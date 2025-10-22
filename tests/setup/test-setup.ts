// Test setup and utilities
import '@testing-library/jest-dom';

// Polyfill for fetch APIs in tests
import 'whatwg-fetch';

// Mock environment variables for tests
process.env.GOOGLE_API_KEY = 'test-api-key';

// Global test utilities can be added here
