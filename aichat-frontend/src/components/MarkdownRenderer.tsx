'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';
import { Copy, Check, ExternalLink } from 'lucide-react';
import 'katex/dist/katex.min.css';

// Props type
interface Props {
  content: string;
  theme?: 'light' | 'dark';
}

// Copy button component
const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors duration-200 opacity-0 group-hover:opacity-100"
      title={copied ? 'Copied!' : 'Copy code'}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
};

// Language badge component
const LanguageBadge: React.FC<{ language: string }> = ({ language }) => (
  <span className="absolute top-2 left-3 px-2 py-1 text-xs font-medium bg-gray-600 text-gray-200 rounded">
    {language}
  </span>
);

export const MarkdownRenderer: React.FC<Props> = ({ content, theme = 'dark' }) => {
  // Define custom markdown render components
  const markdownComponents: Components = {
    // Enhanced code blocks with copy functionality
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const isInline = !match;
      const language = match ? match[1] : '';
      const codeContent = String(children).replace(/\n$/, '');

      if (isInline) {
        return (
          <code
            className="bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded text-sm font-mono"
            {...props}
          >
            {children}
          </code>
        );
      }

      return (
        <div className="relative group my-4">
          <div className="relative">
            <LanguageBadge language={language} />
            <CopyButton text={codeContent} />
            <SyntaxHighlighter
              style={theme === 'dark' ? oneDark : oneLight}
              language={language}
              PreTag="div"
              customStyle={{
                borderRadius: '0.75rem',
                padding: '2.5rem 1rem 1rem 1rem',
                margin: 0,
                fontSize: '0.875rem',
                lineHeight: '1.5',
                border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
              }}
              wrapLines
              wrapLongLines
              showLineNumbers={codeContent.split('\n').length > 10}
              lineNumberStyle={{
                color: theme === 'dark' ? '#6b7280' : '#9ca3af',
                fontSize: '0.75rem',
                paddingRight: '1rem',
                minWidth: '3rem',
              }}
            >
              {codeContent}
            </SyntaxHighlighter>
          </div>
        </div>
      );
    },

    // Bold text styling
    strong: ({ children }) => (
      <strong className="font-bold" style={{ color: '#023B78' }}>
        {children}
      </strong>
    ),

    // Enhanced headings with better spacing
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold mb-4 mt-6 text-gray-300 border-b border-gray-600 pb-2">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-semibold mb-3 mt-5 text-gray-300">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-semibold mb-2 mt-4 text-gray-300">
        {children}
      </h3>
    ),

    // Enhanced blockquotes
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-900/20 italic text-gray-300 rounded-r">
        {children}
      </blockquote>
    ),

    // Enhanced lists
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-1 my-3 text-gray-300 pl-2">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-1 my-3 text-gray-300 pl-2">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed">{children}</li>
    ),

    // Enhanced tables
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-gray-600 rounded-lg overflow-hidden">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-gray-800">{children}</thead>
    ),
    th: ({ children }) => (
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-600">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 text-sm text-gray-300 border-b border-gray-600">
        {children}
      </td>
    ),

    // Enhanced links
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 underline decoration-2 underline-offset-2 hover:decoration-4 transition-all duration-200 inline-flex items-center gap-1"
      >
        {children}
        <ExternalLink size={12} className="opacity-60" />
      </a>
    ),

    // Enhanced paragraphs
    p: ({ children }) => (
      <p className="leading-relaxed mb-4 text-gray-300">
        {children}
      </p>
    ),

    // Enhanced horizontal rules
    hr: () => (
      <hr className="my-6 border-gray-600" />
    ),

    // Task lists (GitHub Flavored Markdown)
    input: ({ checked, ...props }) => (
      <input
        type="checkbox"
        checked={checked}
        readOnly
        className="mr-2 accent-blue-500"
        {...props}
      />
    ),
  };

  return (
    <div className="prose prose-slate max-w-none break-words text-gray-300 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};