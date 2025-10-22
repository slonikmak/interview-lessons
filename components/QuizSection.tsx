'use client';

import { useState } from 'react';
import SectionChat from './SectionChat';
import type { QuizSection as QuizSectionType } from '@/lib/schemas/lesson';

interface QuizSectionProps {
  section: QuizSectionType;
}

export default function QuizSection({ section }: QuizSectionProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };

  const correctCount = section.questions.filter(
    (question) => selectedAnswers[question.id] === question.correctOptionId
  ).length;

  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
      
      <div className="space-y-6">
        {section.questions.map((question, questionIndex) => {
          const isCorrect = selectedAnswers[question.id] === question.correctOptionId;
          const hasAnswer = selectedAnswers[question.id] !== undefined;

          return (
            <div key={question.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
              <p className="font-semibold mb-3 text-gray-800 dark:text-gray-200">
                {questionIndex + 1}. {question.text}
              </p>
              <div className="space-y-2">
                {question.options.map((option) => {
                  const isSelected = selectedAnswers[question.id] === option.id;
                  const isCorrectOption = option.id === question.correctOptionId;
                  
                  let optionClass = 'flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ';
                  
                  if (showResults) {
                    if (isCorrectOption) {
                      optionClass += 'border-green-500 bg-green-50 dark:bg-green-900/20';
                    } else if (isSelected && !isCorrectOption) {
                      optionClass += 'border-red-500 bg-red-50 dark:bg-red-900/20';
                    } else {
                      optionClass += 'border-gray-300 dark:border-gray-600 opacity-60';
                    }
                  } else {
                    if (isSelected) {
                      optionClass += 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
                    } else {
                      optionClass += 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700';
                    }
                  }

                  return (
                    <label key={option.id} className={optionClass}>
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option.id}
                        checked={isSelected}
                        onChange={() => handleOptionSelect(question.id, option.id)}
                        disabled={showResults}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="flex-1 text-gray-700 dark:text-gray-300">
                        {option.text}
                      </span>
                      {showResults && isCorrectOption && (
                        <span className="text-green-600 dark:text-green-400 font-semibold">✓</span>
                      )}
                      {showResults && isSelected && !isCorrectOption && (
                        <span className="text-red-600 dark:text-red-400 font-semibold">✗</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-4 items-center">
        {!showResults ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length !== section.questions.length}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit Answers
          </button>
        ) : (
          <>
            <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Score: {correctCount} / {section.questions.length}
            </div>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Try Again
            </button>
          </>
        )}
      </div>

      {/* AI chat integration */}
      <SectionChat
        sectionId={section.id}
        sectionContext={{
          id: section.id,
          title: section.title,
          type: section.type,
          content: section.questions
            .map(
              (question, index) =>
                `Q${index + 1}: ${question.text}\nOptions: ${question.options
                  .map((option) => option.text)
                  .join(', ')}`
            )
            .join('\n\n'),
        }}
        initialHistory={section.ai_chat_history}
      />
    </section>
  );
}
