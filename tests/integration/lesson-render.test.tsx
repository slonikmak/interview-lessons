/**
 * Integration test: Lesson rendering from public JSON
 * Tests that the app can load and render all sections from two_sum_full.json
 */

import { render, screen, waitFor } from '@testing-library/react';
import Home from '@/app/page';
import type { RawLesson } from '@/lib/schemas/lesson';
import sampleLesson from '../../two_sum_full.json';
import { readFileSync } from 'fs';

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));

describe('Lesson Rendering Integration', () => {
  const mockReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReadFileSync.mockReset();
  });

  it('should render lesson from public JSON with all section titles', async () => {
    mockReadFileSync.mockReturnValueOnce(JSON.stringify(sampleLesson));

    render(await Home());

    await waitFor(() => {
      screen.getByText(sampleLesson.title);
      screen.getByText('Problem understanding');
      screen.getByText('Hash Table (One-pass) — Optimal Solution');
      screen.getByText('Quick check');
    });
  });

  it('should render code editor even when code task has no tests', async () => {
    const unsupportedLesson: RawLesson = {
      id: 'test',
      title: 'Test Lesson',
      sections: [
        {
          title: 'Code Task',
          type: 'code_task',
          starter_code: 'function test() {}',
          tests: [],
        },
      ],
    };

    mockReadFileSync.mockReturnValueOnce(JSON.stringify(unsupportedLesson));

    render(await Home());

    await waitFor(() => {
      // Should not show the unsupported placeholder
      expect(screen.queryByText(/not yet supported/i)).toBeNull();
      // Should render the code editor header or textarea
      screen.getByText('JavaScript');
      screen.getByPlaceholderText('Write your code here...');
    });
  });

  it('should show error banner when lesson fails to load', async () => {
    mockReadFileSync.mockImplementationOnce(() => {
      const error = new Error('File not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      throw error;
    });

    render(await Home());

    await waitFor(() => {
      screen.getByText(/Error Loading Lesson/i);
    });
  });

  it('should show error banner when lesson has invalid format', async () => {
    const invalidLesson = {
      id: 'test',
      // Missing required 'title' and 'sections'
    };

    mockReadFileSync.mockReturnValueOnce(JSON.stringify(invalidLesson));

    render(await Home());

    await waitFor(() => {
      screen.getByText(/Error Loading Lesson/i);
    });
  });
});
