/**
 * Unit tests: Sandbox runner and timeouts
 * Tests the code execution sandbox logic
 */

import { runCode } from '@/lib/sandbox/runCode';
import type { TestCase } from '@/lib/schemas/api';

describe('Sandbox Runner', () => {
  it('should execute valid code and return passed result', async () => {
    const code = 'function twoSum(nums, target) { return [0, 1]; }';
    const tests: TestCase[] = [
      {
        name: 'Test case 1',
        input: [[2, 7, 11, 15], 9],
        expected: [0, 1],
      },
    ];

    const results = await runCode(code, tests, 3000);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      name: 'Test case 1',
      status: 'passed',
    });
  });

  it('should return failed result for incorrect output', async () => {
    const code = 'function twoSum(nums, target) { return [1, 2]; }';
    const tests: TestCase[] = [
      {
        name: 'Test case 1',
        input: [[2, 7, 11, 15], 9],
        expected: [0, 1],
      },
    ];

    const results = await runCode(code, tests, 3000);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      name: 'Test case 1',
      status: 'failed',
    });
    expect(results[0].error).toBeDefined();
  });

  it('should handle runtime errors in user code', async () => {
    const code = 'function twoSum() { throw new Error("Runtime error"); }';
    const tests: TestCase[] = [
      {
        name: 'Error test',
        input: [[1, 2], 3],
        expected: [0, 1],
      },
    ];

    const results = await runCode(code, tests, 3000);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      name: 'Error test',
      status: 'failed',
    });
    expect(results[0].error).toMatch(/error/i);
  });

  it('should timeout infinite loops', async () => {
    const code = 'function twoSum() { while(true) {} return []; }';
    const tests: TestCase[] = [
      {
        name: 'Timeout test',
        input: [],
        expected: [],
      },
    ];

    const results = await runCode(code, tests, 100);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      name: 'Timeout test',
      status: 'failed',
    });
    expect(results[0].error).toMatch(/timeout/i);
  });

  it('should run multiple tests sequentially', async () => {
    const code = 'function twoSum(nums, target) { return [0, 1]; }';
    const tests: TestCase[] = [
      {
        name: 'Test 1',
        input: [[2, 7], 9],
        expected: [0, 1],
      },
      {
        name: 'Test 2',
        input: [[3, 3], 6],
        expected: [0, 1],
      },
      {
        name: 'Test 3',
        input: [[1, 2], 3],
        expected: [0, 1],
      },
    ];

    const results = await runCode(code, tests, 3000);

    expect(results).toHaveLength(3);
    results.forEach((result, index) => {
      expect(result.name).toBe(`Test ${index + 1}`);
      expect(result.status).toBe('passed');
      expect(result.durationMs).toBeDefined();
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
    });
  });

  it('should include duration for each test', async () => {
    const code = 'function twoSum(nums, target) { return [0, 1]; }';
    const tests: TestCase[] = [
      {
        name: 'Duration test',
        input: [[1, 2], 3],
        expected: [0, 1],
      },
    ];

    const results = await runCode(code, tests, 3000);

    expect(results[0].durationMs).toBeDefined();
    expect(typeof results[0].durationMs).toBe('number');
    expect(results[0].durationMs).toBeGreaterThanOrEqual(0);
  });

  it('should handle edge cases in comparison', async () => {
    const code = `
      function twoSum(nums, target) { 
        return { a: 1, b: 2 }; 
      }
    `;
    const tests: TestCase[] = [
      {
        name: 'Object comparison',
        input: [[1, 2], 3],
        expected: { a: 1, b: 2 },
      },
    ];

    const results = await runCode(code, tests, 3000);

    expect(results[0].status).toBe('passed');
  });

  it('should fail when array lengths differ', async () => {
    const code = 'function twoSum(nums, target) { return [0]; }';
    const tests: TestCase[] = [
      {
        name: 'Length mismatch',
        input: [[1, 2], 3],
        expected: [0, 1],
      },
    ];

    const results = await runCode(code, tests, 3000);

    expect(results[0].status).toBe('failed');
  });
});
