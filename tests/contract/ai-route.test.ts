/**
 * Contract test: /api/ai route
 * Tests the AI chat API endpoint
 */

import { POST } from '@/app/api/ai/route';
import { NextRequest } from 'next/server';

// Mock the Google Generative AI
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: jest.fn().mockReturnValue('This is a helpful AI response'),
            },
          }),
        }),
      };
    }),
  };
});

describe('/api/ai Contract Tests', () => {
  it('should accept valid AI request and return response', async () => {
    const mockRequest = { json: async () => ({
      sectionId: 'section-1',
      userMessage: 'What is a hash map?',
      sectionContext: {
        id: 'section-1',
        title: 'Introduction',
        type: 'text',
        content: 'Learn about hash maps',
      },
    }) } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('text');
    expect(typeof data.text).toBe('string');
    expect(data.text.length).toBeGreaterThan(0);
  });

  it('should validate request body with zod and return 400 for invalid input', async () => {
    const mockRequest = { json: async () => ({ sectionId: 'section-1' }) } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
  });

  it('should handle section context with content', async () => {
    const mockRequest = { json: async () => ({
      sectionId: 'section-1',
      userMessage: 'Explain this section',
      sectionContext: {
        id: 'section-1',
        title: 'Hash Maps',
        type: 'text',
        content: 'A hash map is a data structure that stores key-value pairs.',
      },
    }) } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.text).toBeDefined();
  });

  it('should handle chat history in request', async () => {
    const mockRequest = { json: async () => ({
      sectionId: 'section-1',
      userMessage: 'Can you elaborate?',
      sectionContext: {
        id: 'section-1',
        title: 'Introduction',
        type: 'text',
      },
      history: [
        { role: 'user', text: 'What is a hash map?' },
        { role: 'assistant', text: 'A hash map is a data structure...' },
      ],
    }) } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.text).toBeDefined();
  });

  it('should handle code_task section context', async () => {
    const mockRequest = { json: async () => ({
      sectionId: 'code-1',
      userMessage: 'How should I approach this problem?',
      sectionContext: {
        id: 'code-1',
        title: 'Two Sum',
        type: 'code_task',
        content: 'Starter code: function twoSum() {}',
      },
    }) } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.text).toBeDefined();
  });

  it('should require userMessage to be non-empty', async () => {
    const mockRequest = { json: async () => ({
      sectionId: 'section-1',
      userMessage: '',
      sectionContext: { id: 'section-1', title: 'Test', type: 'text' },
    }) } as any;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
  });
});
