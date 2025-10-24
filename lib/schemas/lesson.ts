import { z } from 'zod';

// Chat message schema (shared between sections and AI chat)
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  text: z.string(),
  ts: z.number().optional(),
  code: z.string().optional(), // User's code from editor (for code_task sections)
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// ----- Raw schemas that mirror the canonical lesson JSON structure -----
const RawTestCaseSchema = z.object({
  name: z.string().optional(),
  input: z.unknown().optional(),
  expected: z.unknown().optional(),
});

const RawTextSectionSchema = z.object({
  type: z.literal('text'),
  title: z.string(),
  content: z.string(),
  ai_chat_history: z.array(ChatMessageSchema).optional(),
});

const RawCodeTaskSectionSchema = z.object({
  type: z.literal('code_task'),
  title: z.string(),
  description: z.string().optional(),
  starter_code: z.string(),
  solution_code: z.string().optional(), // Reference solution shown when SKIPPED
  tests: z.array(RawTestCaseSchema).optional(),
  hints: z.array(z.string()).optional(),
  state: z.enum(['NOT_RESOLVED', 'RESOLVED', 'SKIPPED']).optional(),
  ai_chat_history: z.array(ChatMessageSchema).optional(),
});

const RawQuizSectionSchema = z.object({
  type: z.literal('quiz'),
  title: z.string(),
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()).min(2),
      answer: z.string(),
    })
  ),
  ai_chat_history: z.array(ChatMessageSchema).optional(),
});

const RawSectionSchema = z.union([
  RawTextSectionSchema,
  RawCodeTaskSectionSchema,
  RawQuizSectionSchema,
]);

const RawLessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  difficulty: z.string().optional(),
  topics: z.array(z.string()).optional(),
  goal: z.string().optional(),
  sections: z.array(RawSectionSchema).min(1),
  created_at: z.string().optional(),
});

// ----- Normalized application-facing types -----
export type TestCase = {
  name: string;
  input?: unknown;
  expected?: unknown;
};

export const TestCaseSchema = z.object({
  name: z.string(),
  input: z.unknown().optional(),
  expected: z.unknown().optional(),
});

export type QuizOption = {
  id: string;
  text: string;
};

export type QuizQuestion = {
  id: string;
  text: string;
  options: QuizOption[];
  correctOptionId: string;
};

export type TextSection = {
  id: string;
  type: 'text';
  title: string;
  content: string;
  ai_chat_history: ChatMessage[];
};

export type CodeTaskSection = {
  id: string;
  type: 'code_task';
  title: string;
  description?: string;
  starter_code: string;
  solution_code?: string; // Reference solution
  tests: TestCase[];
  hints?: string[];
  state?: 'NOT_RESOLVED' | 'RESOLVED' | 'SKIPPED';
  ai_chat_history: ChatMessage[];
};

export type QuizSection = {
  id: string;
  type: 'quiz';
  title: string;
  questions: QuizQuestion[];
  ai_chat_history: ChatMessage[];
};

export type Section = TextSection | CodeTaskSection | QuizSection;

export type Lesson = {
  id: string;
  title: string;
  difficulty?: string;
  topics?: string[];
  goal?: string;
  sections: Section[];
  created_at?: string;
};

// ----- Normalization helpers -----
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function makeSectionId(title: string, type: Section['type'], index: number): string {
  const base = slugify(title);
  const suffix = base ? `${base}-${index + 1}` : `${index + 1}`;
  return `${type}-${suffix}`;
}

function normalizeTestCases(
  rawTests: Array<z.infer<typeof RawTestCaseSchema>> | undefined
): TestCase[] {
  const tests = rawTests ?? [];
  return tests.map((test, index) => ({
    name: test.name ?? `Test case ${index + 1}`,
    input: test.input,
    expected: test.expected,
  }));
}

function normalizeQuizQuestions(
  rawQuestions: z.infer<typeof RawQuizSectionSchema>['questions']
): QuizQuestion[] {
  return rawQuestions.map((question, questionIndex) => {
    const options = question.options.map((optionText, optionIndex) => ({
      id: `q${questionIndex + 1}-option-${optionIndex + 1}`,
      text: optionText,
    }));

    const matchingOption = options.find((option) => option.text === question.answer);
    const correctOptionId = matchingOption?.id ?? options[0].id;

    return {
      id: `q${questionIndex + 1}`,
      text: question.question,
      options,
      correctOptionId,
    };
  });
}

function normalizeSection(rawSection: z.infer<typeof RawSectionSchema>, index: number): Section {
  switch (rawSection.type) {
    case 'text':
      return {
        id: makeSectionId(rawSection.title, 'text', index),
        type: 'text',
        title: rawSection.title,
        content: rawSection.content,
        ai_chat_history: rawSection.ai_chat_history ?? [],
      };
    case 'code_task':
      return {
        id: makeSectionId(rawSection.title, 'code_task', index),
        type: 'code_task',
        title: rawSection.title,
        description: rawSection.description,
        starter_code: rawSection.starter_code,
        solution_code: rawSection.solution_code,
        tests: normalizeTestCases(rawSection.tests),
        hints: rawSection.hints,
        state: rawSection.state ?? 'NOT_RESOLVED',
        ai_chat_history: rawSection.ai_chat_history ?? [],
      };
    case 'quiz':
      return {
        id: makeSectionId(rawSection.title, 'quiz', index),
        type: 'quiz',
        title: rawSection.title,
        questions: normalizeQuizQuestions(rawSection.questions),
        ai_chat_history: rawSection.ai_chat_history ?? [],
      };
    default:
      throw new Error('Unsupported section type encountered during normalization');
  }
}

function normalizeLesson(rawLesson: z.infer<typeof RawLessonSchema>): Lesson {
  return {
    id: rawLesson.id,
    title: rawLesson.title,
    difficulty: rawLesson.difficulty?.toLowerCase(),
    topics: rawLesson.topics,
    goal: rawLesson.goal,
    sections: rawLesson.sections.map((section, index) => normalizeSection(section, index)),
    created_at: rawLesson.created_at,
  };
}

export const LessonSchema = RawLessonSchema.transform((raw) => normalizeLesson(raw));
export type RawLesson = z.infer<typeof RawLessonSchema>;
export type RawSection = z.infer<typeof RawSectionSchema>;
