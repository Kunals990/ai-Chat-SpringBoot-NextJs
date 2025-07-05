'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';

// Props type
interface Props {
  content: string;
}

// Define custom markdown render components
const markdownComponents: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');

    return match ? (
      <SyntaxHighlighter
        style={oneDark}
        language={match[1]}
        PreTag="div"
        customStyle={{
          borderRadius: '0.5rem',
          padding: '1rem',
          margin: '0.5rem 0',
          fontSize: '0.875rem',
        }}
        wrapLines
        wrapLongLines
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code
        className="bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-sm"
        {...props}
      >
        {children}
      </code>
    );
  },
};

export const MarkdownRenderer: React.FC<Props> = ({ content }) => {
  return (
    <div className="prose prose-slate max-w-none break-words text-inherit [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
