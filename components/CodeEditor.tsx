'use client';

import { useState, useRef, useEffect } from 'react';
import { Highlight, themes } from 'prism-react-renderer';

interface CodeEditorProps {
  initialCode: string;
  onCodeChange?: (code: string) => void;
}

export default function CodeEditor({ initialCode, onCodeChange }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLDivElement>(null);

  // Sync with external code changes (e.g., when solution is shown)
  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [code]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current && textareaRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      onCodeChange?.(newCode);
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-mono text-gray-600 dark:text-gray-300">
        JavaScript
      </div>
      <div className="relative bg-[#1e1e1e]">
        {/* Syntax highlighted code display */}
        <Highlight theme={themes.vsDark} code={code} language="javascript">
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <div
              ref={preRef}
              className="absolute top-0 left-0 w-full pointer-events-none"
              style={{
                padding: '1rem',
                paddingLeft: '3.5rem',
                whiteSpace: 'pre',
              }}
            >
              <div className="font-mono text-sm">
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })} className="flex">
                    <span 
                      className="inline-block text-right pr-4 select-none text-gray-500"
                      style={{ 
                        minWidth: '2.5rem',
                        marginLeft: '-2.5rem',
                      }}
                    >
                      {i + 1}
                    </span>
                    <span className="flex-1" style={{ whiteSpace: 'pre' }}>
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Highlight>
        {/* Editable textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleChange}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          className="relative w-full font-mono text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
          style={{
            padding: '1rem',
            paddingLeft: '3.5rem',
            color: 'transparent',
            caretColor: 'white',
            WebkitTextFillColor: 'transparent',
            whiteSpace: 'pre',
          }}
          spellCheck={false}
          placeholder="Write your code here..."
        />
      </div>
    </div>
  );
}
