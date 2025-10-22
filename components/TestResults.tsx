'use client';

import type { TestResult } from '@/lib/schemas/api';

interface TestResultsProps {
  results: TestResult[];
  isLoading?: boolean;
  error?: string;
}

export default function TestResults({ results, isLoading, error }: TestResultsProps) {
  if (error) {
    return (
      <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          Execution Error
        </h3>
        <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
        <p className="text-blue-700 dark:text-blue-300">Running tests...</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return null;
  }

  const passedCount = results.filter((r) => r.status === 'passed').length;
  const totalCount = results.length;
  const allPassed = passedCount === totalCount;

  return (
    <div className="mt-4 space-y-2">
      <div
        className={`p-4 rounded-lg border ${
          allPassed
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
        }`}
      >
        <h3
          className={`text-lg font-semibold mb-2 ${
            allPassed
              ? 'text-green-800 dark:text-green-200'
              : 'text-yellow-800 dark:text-yellow-200'
          }`}
        >
          {allPassed ? '✓ All Tests Passed!' : `${passedCount}/${totalCount} Tests Passed`}
        </h3>
      </div>

      <div className="space-y-2">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${
              result.status === 'passed'
                ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p
                  className={`font-semibold ${
                    result.status === 'passed'
                      ? 'text-green-800 dark:text-green-300'
                      : 'text-red-800 dark:text-red-300'
                  }`}
                >
                  {result.status === 'passed' ? '✓' : '✗'} {result.name}
                </p>
                {result.error && (
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">{result.error}</p>
                )}
                {result.output !== undefined && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Output: {JSON.stringify(result.output)}
                  </p>
                )}
              </div>
              {result.durationMs !== undefined && (
                <span className="text-xs text-gray-500 dark:text-gray-500 ml-2">
                  {result.durationMs}ms
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
