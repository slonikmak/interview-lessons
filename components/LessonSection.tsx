'use client';

import { useState } from 'react';
import type { Section } from '@/lib/schemas/lesson';
import type { TestResult } from '@/lib/schemas/api';
import TextSection from './TextSection';
import UnsupportedSection from './UnsupportedSection';
import CodeEditor from './CodeEditor';
import TestResults from './TestResults';
import SectionChat from './SectionChat';
import QuizSection from './QuizSection';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

interface LessonSectionProps {
  section: Section;
}

export default function LessonSection({ section }: LessonSectionProps) {
  const [code, setCode] = useState(
    section.type === 'code_task' ? section.starter_code : ''
  );
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskState, setTaskState] = useState<'NOT_RESOLVED' | 'RESOLVED' | 'SKIPPED'>(
    section.type === 'code_task' ? (section.state ?? 'NOT_RESOLVED') : 'NOT_RESOLVED'
  );

  if (section.type === 'text') {
    return <TextSection section={section} />;
  }

  if (section.type === 'code_task') {
    const hasTests = section.tests && section.tests.length > 0;
    
    const handleRunTests = async () => {
      if (!hasTests) return;
      setIsRunning(true);
      setError(null);
      setTestResults([]);

      try {
        const response = await fetch('/api/run', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            tests: section.tests,
            timeoutMs: 3000,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to run tests');
        }

        const data = await response.json();
        setTestResults(data.results);
        
        // Check if all tests passed
        const allPassed = data.results.every((result: TestResult) => result.status === 'passed');
        if (allPassed) {
          setTaskState('RESOLVED');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to run tests');
      } finally {
        setIsRunning(false);
      }
    };

    const handleShowSolution = () => {
      if (section.solution_code) {
        setCode(section.solution_code);
        setTaskState('SKIPPED');
        setTestResults([]); // Clear test results
        setError(null); // Clear any errors
      }
    };

    return (
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
        {section.description && (
          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 mb-4">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[
                rehypeSlug,
                [
                  rehypeAutolinkHeadings,
                  {
                    behavior: 'wrap',
                    properties: {
                      className: ['anchor'],
                    },
                  },
                ],
              ]}
            >
              {section.description}
            </ReactMarkdown>
          </div>
        )}
        
        <div className="mb-4">
          <CodeEditor initialCode={code} onCodeChange={setCode} />
        </div>

        {hasTests ? (
          <>
            <div className="flex gap-3">
              <button
                onClick={handleRunTests}
                disabled={isRunning}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isRunning ? 'Running Tests...' : 'Run Tests'}
              </button>

              {section.solution_code && taskState !== 'SKIPPED' && (
                <button
                  onClick={handleShowSolution}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Show Solution
                </button>
              )}

              {taskState === 'RESOLVED' && (
                <span className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold rounded-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Resolved
                </span>
              )}

              {taskState === 'SKIPPED' && (
                <span className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 font-semibold rounded-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Solution Shown
                </span>
              )}
            </div>

            <TestResults results={testResults} isLoading={isRunning} error={error || undefined} />
          </>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">No tests provided for this task. Explore and edit the code above.</p>
        )}

        {section.hints && section.hints.length > 0 && (
          <details className="mt-6">
            <summary className="cursor-pointer text-blue-600 dark:text-blue-400 font-semibold">
              Hints ({section.hints.length})
            </summary>
            <ul className="mt-2 space-y-2 pl-4">
              {section.hints.map((hint, index) => (
                <li key={index} className="text-gray-700 dark:text-gray-300">
                  {hint}
                </li>
              ))}
            </ul>
          </details>
        )}
        
        {/* AI chat integration */}
        <SectionChat
          sectionId={section.id}
          sectionContext={{
            id: section.id,
            title: section.title,
            type: section.type,
            content: [
              section.description ?? '',
              'Starter code:',
              section.starter_code,
              hasTests ? 'Test cases:' : '',
              hasTests
                ? section.tests
                    .map(
                      (test, index) =>
                        `#${index + 1} -> input: ${JSON.stringify(test.input)}, expected: ${JSON.stringify(
                          test.expected
                        )}`
                    )
                    .join('\n')
                : '',
            ]
              .filter(Boolean)
              .join('\n\n'),
            metadata: {
              totalTests: hasTests ? section.tests.length : 0,
              hints: section.hints,
            },
          }}
          initialHistory={section.ai_chat_history}
          currentCode={code}
        />
      </section>
    );
  }

  if (section.type === 'quiz') {
    return <QuizSection section={section} />;
  }

  return <UnsupportedSection section={section} />;
}
