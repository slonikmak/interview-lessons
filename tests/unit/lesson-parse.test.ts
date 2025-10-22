/**
 * Unit test: Lesson parsing and zod validation
 * Tests that lesson schemas validate correctly and surface errors
 */

import { LessonSchema } from '@/lib/schemas/lesson';

describe('Lesson Schema Validation', () => {
  it('should validate a complete lesson with all fields', () => {
    const validLesson = {
      id: 'test-lesson',
      title: 'Test Lesson',
      difficulty: 'Beginner',
      topics: ['testing', 'validation'],
      goal: 'Learn to test',
      sections: [
        {
          title: 'Introduction',
          type: 'text' as const,
          content: 'Welcome to the lesson',
        },
      ],
    };

    const result = LessonSchema.safeParse(validLesson);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('test-lesson');
      expect(result.data.sections).toHaveLength(1);
      expect(result.data.sections[0].id).toBeDefined();
      expect(result.data.difficulty).toBe('beginner');
    }
  });

  it('should validate a minimal lesson with only required fields', () => {
    const minimalLesson = {
      id: 'minimal',
      title: 'Minimal Lesson',
      sections: [
        {
          title: 'Section',
          type: 'text' as const,
          content: 'Content',
        },
      ],
    };

    const result = LessonSchema.safeParse(minimalLesson);
    expect(result.success).toBe(true);
  });

  it('should reject lesson without id', () => {
    const invalidLesson = {
      title: 'No ID',
      sections: [
        {
          id: 's1',
          title: 'Section',
          type: 'text',
          content: 'Content',
        },
      ],
    };

    const result = LessonSchema.safeParse(invalidLesson);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ['id'],
          }),
        ])
      );
    }
  });

  it('should reject lesson without title', () => {
    const invalidLesson = {
      id: 'test',
      sections: [
        {
          id: 's1',
          title: 'Section',
          type: 'text',
          content: 'Content',
        },
      ],
    };

    const result = LessonSchema.safeParse(invalidLesson);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ['title'],
          }),
        ])
      );
    }
  });

  it('should reject lesson with empty sections array', () => {
    const invalidLesson = {
      id: 'test',
      title: 'Test',
      sections: [],
    };

    const result = LessonSchema.safeParse(invalidLesson);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ['sections'],
          }),
        ])
      );
    }
  });

  it('should validate text section', () => {
    const lesson = {
      id: 'test',
      title: 'Test',
      sections: [
        {
          title: 'Text Section',
          type: 'text' as const,
          content: 'Some content here',
          ai_chat_history: [
            {
              role: 'user',
              text: 'Hello',
              ts: 1234567890,
            },
          ],
        },
      ],
    };

    const result = LessonSchema.safeParse(lesson);
    expect(result.success).toBe(true);
  });

  it('should validate code_task section', () => {
    const lesson = {
      id: 'test',
      title: 'Test',
      sections: [
        {
          title: 'Code Task',
          type: 'code_task' as const,
          starter_code: 'function solution() {}',
          tests: [
            {
              input: [1, 2],
              expected: 3,
            },
          ],
          hints: ['Try using a loop'],
        },
      ],
    };

    const result = LessonSchema.safeParse(lesson);
    expect(result.success).toBe(true);
  });

  it('should validate quiz section', () => {
    const lesson = {
      id: 'test',
      title: 'Test',
      sections: [
        {
          title: 'Quiz',
          type: 'quiz' as const,
          questions: [
            {
              question: 'What is 2+2?',
              options: ['3', '4'],
              answer: '4',
            },
          ],
        },
      ],
    };

    const result = LessonSchema.safeParse(lesson);
    expect(result.success).toBe(true);
  });

  it('should reject quiz with less than 2 options', () => {
    const lesson = {
      id: 'test',
      title: 'Test',
      sections: [
        {
          title: 'Quiz',
          type: 'quiz' as const,
          questions: [
            {
              question: 'Question?',
              options: ['Only one option'],
              answer: 'Only one option',
            },
          ],
        },
      ],
    };

    const result = LessonSchema.safeParse(lesson);
    expect(result.success).toBe(false);
  });

  it('should normalize difficulty casing when provided', () => {
    const lesson = {
      id: 'test',
      title: 'Test',
      difficulty: 'INTERMEDIATE',
      sections: [
        {
          title: 'Section',
          type: 'text' as const,
          content: 'Content',
        },
      ],
    };

    const result = LessonSchema.safeParse(lesson);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.difficulty).toBe('intermediate');
    }
  });
});
