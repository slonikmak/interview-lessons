/**
 * Integration test: Code task UI run flow
 * Tests the complete flow from UI to API to results display
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock CodeEditor and TestResults components
jest.mock('@/components/CodeEditor', () => {
  return function MockCodeEditor({ initialCode, onCodeChange }: any) {
    return (
      <textarea
        data-testid="code-editor"
        defaultValue={initialCode}
        onChange={(e) => onCodeChange?.(e.target.value)}
      />
    );
  };
});

jest.mock('@/components/TestResults', () => {
  return function MockTestResults({ results, isLoading, error }: any) {
    if (error) return <div data-testid="test-error">{error}</div>;
    if (isLoading) return <div data-testid="test-loading">Running tests...</div>;
    if (!results || results.length === 0) return null;
    return (
      <div data-testid="test-results">
        {results.map((r: any, i: number) => (
          <div key={i} data-testid={`result-${i}`}>
            {r.name}: {r.status}
          </div>
        ))}
      </div>
    );
  };
});

// Mock fetch
global.fetch = jest.fn();

import LessonSection from '@/components/LessonSection';
import type { CodeTaskSection } from '@/lib/schemas/lesson';

describe('Code Task UI Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCodeTaskSection: CodeTaskSection = {
    id: 'code-1',
    title: 'Two Sum',
    type: 'code_task',
    starter_code: 'function twoSum(nums, target) {\n  // Your code here\n}',
    tests: [
      {
        name: 'Test 1',
        input: [[2, 7, 11, 15], 9],
        expected: [0, 1],
      },
      {
        name: 'Test 2',
        input: [[3, 2, 4], 6],
        expected: [1, 2],
      },
    ],
    hints: ['Try using a hash map', 'Consider time complexity'],
  };

  it('should render code task section with editor and run button', () => {
    render(<LessonSection section={mockCodeTaskSection} />);

    expect(screen.getByText('Two Sum')).toBeInTheDocument();
    expect(screen.getByTestId('code-editor')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /run tests/i })).toBeInTheDocument();
  });

  it('should display hints in a details element', () => {
    render(<LessonSection section={mockCodeTaskSection} />);

    const hintsElement = screen.getByText(/hints/i);
    expect(hintsElement).toBeInTheDocument();
  });

  it('should send code to API when run button is clicked', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { name: 'Test 1', status: 'passed' },
          { name: 'Test 2', status: 'passed' },
        ],
      }),
    });

    render(<LessonSection section={mockCodeTaskSection} />);

    const runButton = screen.getByRole('button', { name: /run tests/i });
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/run',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('twoSum'),
        })
      );
    });
  });

  it('should display test results after successful run', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { name: 'Test 1', status: 'passed' },
          { name: 'Test 2', status: 'failed', error: 'Wrong output' },
        ],
      }),
    });

    render(<LessonSection section={mockCodeTaskSection} />);

    const runButton = screen.getByRole('button', { name: /run tests/i });
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByTestId('test-results')).toBeInTheDocument();
    });

    expect(screen.getByText(/Test 1: passed/)).toBeInTheDocument();
    expect(screen.getByText(/Test 2: failed/)).toBeInTheDocument();
  });

  it('should show loading state while tests are running', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ results: [] }),
              }),
            100
          );
        })
    );

    render(<LessonSection section={mockCodeTaskSection} />);

    const runButton = screen.getByRole('button', { name: /run tests/i });
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByTestId('test-loading')).toBeInTheDocument();
    });
  });

  it('should display error message when API call fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Server error' }),
    });

    render(<LessonSection section={mockCodeTaskSection} />);

    const runButton = screen.getByRole('button', { name: /run tests/i });
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByTestId('test-error')).toBeInTheDocument();
    });

    expect(screen.getByText(/Server error/)).toBeInTheDocument();
  });

  it('should allow editing code and running with updated code', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [{ name: 'Test 1', status: 'passed' }] }),
    });

    render(<LessonSection section={mockCodeTaskSection} />);

    const editor = screen.getByTestId('code-editor');
    const newCode = 'function twoSum() { return [1, 2]; }';
    
    fireEvent.change(editor, { target: { value: newCode } });

    const runButton = screen.getByRole('button', { name: /run tests/i });
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/run',
        expect.objectContaining({
          body: expect.stringContaining('return [1, 2]'),
        })
      );
    });
  });
});
