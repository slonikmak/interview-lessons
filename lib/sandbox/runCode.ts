import { TestCase, TestResult } from '@/lib/schemas/api';
import { TimeoutError } from '@/lib/errors';
import { Worker } from 'worker_threads';

/**
 * Runs user code against provided test cases in a sandboxed environment
 * @param code - The user's code (must define the solution function)
 * @param tests - Array of test cases to run
 * @param timeoutMs - Timeout per test in milliseconds (default 3000)
 * @returns Array of test results
 */
export async function runCode(
  code: string,
  tests: TestCase[],
  timeoutMs = 3000
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  for (const test of tests) {
    const startTime = Date.now();
    try {
      const result = await runSingleTest(code, test, timeoutMs);
      results.push({
        ...result,
        durationMs: Date.now() - startTime,
      });
    } catch (error) {
      results.push({
        name: test.name,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        durationMs: Date.now() - startTime,
      });
    }
  }

  return results;
}

/**
 * Extracts the first function name from user code
 * Supports: function name(), const name = function(), const name = () => {}
 */
function extractFunctionName(code: string): string | null {
  // Match function declarations: function name()
  const functionDeclaration = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/;
  const match1 = code.match(functionDeclaration);
  if (match1) return match1[1];

  // Match arrow functions and function expressions: const/let/var name = 
  const functionExpression = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:function|\([^)]*\)\s*=>|[a-zA-Z_$][a-zA-Z0-9_$]*\s*=>)/;
  const match2 = code.match(functionExpression);
  if (match2) return match2[1];

  return null;
}

/**
 * Runs a single test case with timeout
 */
async function runSingleTest(
  code: string,
  test: TestCase,
  timeoutMs: number
): Promise<TestResult> {
  if (test.input === undefined || test.expected === undefined) {
    return {
      name: test.name,
      status: 'failed',
      error: 'Test case missing input or expected value',
    };
  }

  // Execute the test inside a Worker so that synchronous infinite loops
  // can be terminated by the main thread via worker.terminate().
  
  // Extract function name from user code
  const functionName = extractFunctionName(code);
  if (!functionName) {
    return {
      name: test.name,
      status: 'failed',
      error: 'No function found in code. Please define a function.',
    };
  }

  return new Promise((resolve, reject) => {

    const workerScript = `
      const { parentPort, workerData } = require('worker_threads');
      (async () => {
        try {
          const { code, input, expected, functionName } = workerData;
          // Evaluate user code in worker scope
          eval(code);

          // Dynamically call the function by name
          const fn = eval(functionName);
          
          let output;
          if (typeof fn !== 'function') {
            throw new Error('Expected ' + functionName + ' to be a function');
          }
          
          // Handle different input formats:
          // 1. Array: [arg1, arg2, ...] -> fn(arg1, arg2, ...)
          // 2. Object: {key1: val1, key2: val2} -> fn(val1, val2, ...)
          // 3. Primitive: value -> fn(value)
          if (Array.isArray(input)) {
            output = fn(...input);
          } else if (typeof input === 'object' && input !== null) {
            // Convert object values to array and pass as separate arguments
            output = fn(...Object.values(input));
          } else {
            output = fn(input);
          }

          parentPort.postMessage({ output, expected });
        } catch (err) {
          parentPort.postMessage({ error: err && err.message ? err.message : String(err) });
        }
      })();
    `;

    const worker = new Worker(workerScript, {
      eval: true,
      workerData: {
        code,
        input: test.input,
        expected: test.expected,
        functionName,
      },
    });

    let finished = false;

    const timer = setTimeout(() => {
      if (finished) return;
      finished = true;
      // terminate worker and reject with timeout
      worker.terminate().finally(() => {
        reject(new TimeoutError(`Test "${test.name}" exceeded ${timeoutMs}ms timeout`));
      });
    }, timeoutMs);

    worker.on('message', (msg: any) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);

      if (msg && msg.error) {
        reject(new Error(msg.error));
        return;
      }

      const { output, expected } = msg;
      const passed = deepEqual(output, expected);

      resolve({
        name: test.name,
        status: passed ? 'passed' : 'failed',
        output,
        error: passed ? undefined : `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(output)}`,
      });
    });

    worker.on('error', (err: Error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      reject(err);
    });

    worker.on('exit', (code: number) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

/**
 * Creates a minimal sandbox environment
 * Restricts access to dangerous globals
 */
function createSandbox(): Record<string, unknown> {
  return {
    console: {
      log: (...args: unknown[]) => {
        // In a real implementation, you might capture these
        return args;
      },
    },
    // Add other safe globals as needed
  };
}

/**
 * Deep equality check for test results
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false;
  }

  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
      return false;
    }
  }

  return true;
}
