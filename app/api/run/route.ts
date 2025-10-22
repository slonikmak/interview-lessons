import { NextRequest, NextResponse } from 'next/server';
import { RunRequestSchema } from '@/lib/schemas/api';
import { runCode } from '@/lib/sandbox/runCode';
import { formatErrorResponse, ValidationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request with zod
    const result = RunRequestSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Invalid request body', result.error.format());
    }

    const { code, tests, timeoutMs } = result.data;

    // Execute code against tests
    const results = await runCode(code, tests, timeoutMs);

    return new Response(JSON.stringify({ results }), {
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

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
