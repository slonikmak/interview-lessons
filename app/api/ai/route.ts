import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIRequestSchema } from '@/lib/schemas/api';
import { getServerEnv } from '@/lib/env.server';
import { formatErrorResponse, ValidationError, ExternalServiceError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request with zod
    const result = AIRequestSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Invalid request body', result.error.format());
    }

    const { userMessage, sectionContext, history } = result.data;

    // Get API key from server environment
    const env = getServerEnv();
    const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    // Build context for the AI
    const contextText = buildContextPrompt(sectionContext, history);
    const fullPrompt = `${contextText}\n\nUser question: ${userMessage}`;

    // Call Gemini API
    const aiResponse = await model.generateContent(fullPrompt);
    const responseText = aiResponse.response.text();

    if (!responseText) {
      throw new ExternalServiceError('AI service returned empty response');
    }

    return new Response(JSON.stringify({ text: responseText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    
    if (error instanceof ValidationError) {
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (error instanceof ExternalServiceError) {
      return new Response(JSON.stringify(errorResponse), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Builds a context prompt for the AI including section context and chat history
 */
function buildContextPrompt(
  sectionContext: {
    id: string;
    title: string;
    type: string;
    content?: string;
    metadata?: Record<string, unknown>;
  },
  history?: Array<{ role: string; text: string; code?: string }>
): string {
  let prompt = `You are a helpful coding tutor assistant. You're helping a student with a lesson section.\n\n`;
  prompt += `Section: ${sectionContext.title}\n`;
  prompt += `Section Type: ${sectionContext.type}\n`;

  if (sectionContext.content) {
    prompt += `Section Content:\n${sectionContext.content}\n\n`;
  }

  if (sectionContext.metadata) {
    const metadataEntries = Object.entries(sectionContext.metadata)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`);
    if (metadataEntries.length > 0) {
      prompt += `Additional Details:\n${metadataEntries.join('\n')}\n\n`;
    }
  }

  if (history && history.length > 0) {
    prompt += `Previous conversation:\n`;
    for (const msg of history) {
      prompt += `${msg.role}: ${msg.text}\n`;
      if (msg.code) {
        prompt += `[User's current code]:\n${msg.code}\n`;
      }
    }
    prompt += `\n`;
  }

  prompt += `Please provide helpful, concise answers that guide the student without giving away complete solutions. Focus on teaching concepts and problem-solving approaches.`;

  return prompt;
}
