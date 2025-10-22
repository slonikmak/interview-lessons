import { z } from 'zod';
import { ChatMessageSchema, TestCaseSchema } from './lesson';

// Re-export types from lesson schema
export type { TestCase, ChatMessage } from './lesson';

// Section context for AI requests
export const SectionContextSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['text', 'code_task', 'quiz']),
  content: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type SectionContext = z.infer<typeof SectionContextSchema>;

// AI API request/response schemas
export const AIRequestSchema = z.object({
  sectionId: z.string(),
  userMessage: z.string().min(1),
  sectionContext: SectionContextSchema,
  history: z.array(ChatMessageSchema).optional(),
});

export type AIRequest = z.infer<typeof AIRequestSchema>;

export const AIResponseSchema = z.object({
  text: z.string(),
});

export type AIResponse = z.infer<typeof AIResponseSchema>;

// Code execution API request/response schemas
export const RunRequestSchema = z.object({
  code: z.string().min(1),
  tests: z.array(TestCaseSchema).min(1),
  timeoutMs: z.number().int().positive().default(3000),
});

export type RunRequest = z.infer<typeof RunRequestSchema>;

export const TestResultSchema = z.object({
  name: z.string(),
  status: z.enum(['passed', 'failed']),
  error: z.string().nullable().optional(),
  output: z.unknown().optional(),
  durationMs: z.number().int().optional(),
});

export type TestResult = z.infer<typeof TestResultSchema>;

export const RunResponseSchema = z.object({
  results: z.array(TestResultSchema),
});

export type RunResponse = z.infer<typeof RunResponseSchema>;
