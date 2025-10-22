/**
 * Contract test: /api/run route
 * Tests the code execution API endpoint
 */

import { POST } from '@/app/api/run/route';
import { NextRequest } from 'next/server';

describe('/api/run Contract Tests', () => {
  it('should execute code and return test results for passing tests', async () => {
    const mockRequest = {
      json: async () => ({
        code: 'function twoSum(nums, target) { return [0, 1]; }',
        tests: [
          {
            name: 'Test 1',
            input: [[2, 7, 11, 15], 9],
            expected: [0, 1],
          },
        ],
        timeoutMs: 3000,
      }),
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('results');
    expect(Array.isArray(data.results)).toBe(true);
    expect(data.results[0]).toMatchObject({
      name: 'Test 1',
      status: 'passed',
    });
  });

  it('should return failed status for incorrect code', async () => {
    const mockRequest = { json: async () => ({
      code: 'function twoSum(nums, target) { return [0, 0]; }',
      tests: [
        {
          name: 'Test 1',
          input: [[2, 7, 11, 15], 9],
          expected: [0, 1],
        },
      ],
    }) } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results[0]).toMatchObject({
      name: 'Test 1',
      status: 'failed',
    });
    expect(data.results[0].error).toBeDefined();
  });

  it('should validate request body with zod and return 400 for invalid input', async () => {
    const mockRequest = { json: async () => ({ tests: [] }) } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
  });

  it('should handle empty tests array validation', async () => {
    const mockRequest = { json: async () => ({ code: 'function test() {}', tests: [] }) } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
  });

  it('should respect timeout parameter', async () => {
    const mockRequest = { json: async () => ({
      code: 'function twoSum() { while(true) {} }',
      tests: [
        {
          name: 'Timeout Test',
          input: [],
          expected: null,
        },
      ],
      timeoutMs: 100,
    }) } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results[0]).toMatchObject({
      name: 'Timeout Test',
      status: 'failed',
    });
    expect(data.results[0].error).toMatch(/timeout/i);
  });

  it('should handle multiple tests', async () => {
    const mockRequest = { json: async () => ({
      code: 'function twoSum(nums, target) { return [0, 1]; }',
      tests: [
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
      ],
    }) } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results).toHaveLength(2);
    expect(data.results[0].name).toBe('Test 1');
    expect(data.results[1].name).toBe('Test 2');
  });
});
