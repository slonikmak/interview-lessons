/**
 * Integration test: Section chat UI
 * Tests the complete chat flow from UI to API
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SectionChat from '@/components/SectionChat';

// Mock fetch
global.fetch = jest.fn();

describe('Section Chat Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockSectionContext = {
    id: 'section-1',
    title: 'Introduction',
    type: 'text' as const,
    content: 'This is a test section',
    metadata: {
      summary: 'Test metadata',
    },
  };

  it('should render chat input and send button', () => {
    render(<SectionChat sectionId="section-1" sectionContext={mockSectionContext} />);

    screen.getByPlaceholderText(/ask a question/i);
    screen.getByRole('button', { name: /send/i });
  });

  it('should disable send button when input is empty', () => {
    render(<SectionChat sectionId="section-1" sectionContext={mockSectionContext} />);

    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toHaveProperty('disabled', true);
  });

  it('should enable send button when input has text', () => {
    render(<SectionChat sectionId="section-1" sectionContext={mockSectionContext} />);

    const input = screen.getByPlaceholderText(/ask a question/i);
    fireEvent.change(input, { target: { value: 'Test question' } });

    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toHaveProperty('disabled', false);
  });

  it('should send message to API when send button is clicked', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ text: 'AI response' }),
    });

    render(<SectionChat sectionId="section-1" sectionContext={mockSectionContext} />);

    const input = screen.getByPlaceholderText(/ask a question/i);
    fireEvent.change(input, { target: { value: 'What is this?' } });

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ai',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('What is this?'),
        })
      );
    });
  });

  it('should display user message and AI response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ text: 'AI response text' }),
    });

    render(<SectionChat sectionId="section-1" sectionContext={mockSectionContext} />);

    const input = screen.getByPlaceholderText(/ask a question/i);
    fireEvent.change(input, { target: { value: 'Test question' } });

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      screen.getByText('Test question');
      screen.getByText('AI response text');
    });
  });

  it('should clear input after sending message', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ text: 'Response' }),
    });

    render(<SectionChat sectionId="section-1" sectionContext={mockSectionContext} />);

    const input = screen.getByPlaceholderText(/ask a question/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Question' } });

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('should show loading state while waiting for response', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ text: 'Response' }),
              }),
            100
          );
        })
    );

    render(<SectionChat sectionId="section-1" sectionContext={mockSectionContext} />);

    const input = screen.getByPlaceholderText(/ask a question/i);
    fireEvent.change(input, { target: { value: 'Question' } });

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      screen.getByText(/sending/i);
    });
  });

  it('should display error message when API call fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'AI service error' }),
    });

    render(<SectionChat sectionId="section-1" sectionContext={mockSectionContext} />);

    const input = screen.getByPlaceholderText(/ask a question/i);
    fireEvent.change(input, { target: { value: 'Question' } });

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      screen.getByText(/AI service error/i);
    });
  });

  it('should allow dismissing error messages', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Error occurred' }),
    });

    render(<SectionChat sectionId="section-1" sectionContext={mockSectionContext} />);

    const input = screen.getByPlaceholderText(/ask a question/i);
    fireEvent.change(input, { target: { value: 'Question' } });

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      screen.getByText(/Error occurred/i);
    });

    const dismissButton = screen.getByText(/dismiss/i);
    fireEvent.click(dismissButton);

    await waitFor(() => {
      expect(screen.queryByText(/Error occurred/i)).toBeNull();
    });
  });

  it('should include chat history in subsequent requests', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ text: 'First response' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ text: 'Second response' }),
      });

    render(<SectionChat sectionId="section-1" sectionContext={mockSectionContext} />);

    // Send first message
    const input = screen.getByPlaceholderText(/ask a question/i);
    fireEvent.change(input, { target: { value: 'First question' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      screen.getByText('First response');
    });

    // Send second message
    fireEvent.change(input, { target: { value: 'Second question' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      const calls = (global.fetch as jest.Mock).mock.calls;
      const secondCallBody = JSON.parse(calls[1][1].body);
      expect(secondCallBody.history).toHaveLength(2);
    });
  });

  it('should send on Enter key press', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ text: 'Response' }),
    });

    render(<SectionChat sectionId="section-1" sectionContext={mockSectionContext} />);

    const input = screen.getByPlaceholderText(/ask a question/i);
    fireEvent.change(input, { target: { value: 'Question' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
