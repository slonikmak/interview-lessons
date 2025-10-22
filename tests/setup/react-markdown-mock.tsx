import React from 'react';

// Simple mock for react-markdown that renders raw children
// We also accept props used in the app to avoid prop warnings
const ReactMarkdownMock: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  return <div data-testid="react-markdown-mock">{children}</div>;
};

export default ReactMarkdownMock;
