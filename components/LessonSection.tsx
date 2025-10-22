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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to run tests');
      } finally {
        setIsRunning(false);
      }
    };

    return (
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
        {section.description && (
          <p className="mb-4 text-gray-700 dark:text-gray-300">{section.description}</p>
        )}
        
        <div className="mb-4">
          <CodeEditor initialCode={section.starter_code} onCodeChange={setCode} />
        </div>

        {hasTests ? (
          <>
            <button
              onClick={handleRunTests}
              disabled={isRunning}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isRunning ? 'Running Tests...' : 'Run Tests'}
            </button>

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
        />
      </section>
    );
  }

  if (section.type === 'quiz') {
    return <QuizSection section={section} />;
  }

  return <UnsupportedSection section={section} />;
}
