import React from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  // Split content by code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="markdown-body space-y-3 select-text">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // Parse code block
          const lines = part.slice(3, -3).trim().split('\n');
          let language = '';
          let codeLines = [...lines];
          if (lines[0] && !lines[0].includes(' ') && lines[0].length < 15) {
            language = lines[0];
            codeLines = lines.slice(1);
          }
          const codeText = codeLines.join('\n');

          return <CodeBlock key={index} code={codeText} language={language} />;
        }

        // Parse regular text lines
        const lines = part.split('\n');
        return (
          <div key={index} className="space-y-2">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lIdx} className="h-1" />;

              // Headers
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={lIdx} className="text-sm font-bold text-text-primary mt-3 mb-1 font-inter">
                    {parseInline(trimmed.slice(4))}
                  </h4>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3 key={lIdx} className="text-base font-bold text-text-primary mt-4 mb-1 font-inter">
                    {parseInline(trimmed.slice(3))}
                  </h3>
                );
              }
              if (trimmed.startsWith('# ')) {
                return (
                  <h2 key={lIdx} className="text-lg font-extrabold text-text-primary mt-5 mb-2 font-inter">
                    {parseInline(trimmed.slice(2))}
                  </h2>
                );
              }

              // Unordered List
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <ul key={lIdx} className="list-disc pl-5 my-1 space-y-1">
                    <li className="text-xs text-text-secondary leading-relaxed">
                      {parseInline(trimmed.slice(2))}
                    </li>
                  </ul>
                );
              }

              // Ordered List
              const numListMatch = trimmed.match(/^(\d+)\.\s(.*)/);
              if (numListMatch) {
                return (
                  <ol key={lIdx} className="pl-1 my-1.5 space-y-1">
                    <li className="text-xs text-text-secondary leading-relaxed flex gap-2 items-start">
                      <span className="text-primary font-bold font-inter text-[11px] mt-[1.5px] min-w-[14px]">
                        {numListMatch[1]}.
                      </span>
                      <span className="flex-1">{parseInline(numListMatch[2])}</span>
                    </li>
                  </ol>
                );
              }

              // Standard text block
              return (
                <p key={lIdx} className="text-xs text-text-secondary leading-relaxed">
                  {parseInline(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function CodeBlock({ code, language }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-xl bg-zinc-950/95 border border-zinc-800/60 p-4 font-mono text-[11px] text-zinc-300 shadow-inner group">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
        title="Copy code"
      >
        {copied ? <Check size={11} className="text-emerald-400 animate-pulse" /> : <Copy size={11} />}
      </button>
      
      {language && (
        <span className="absolute top-2 left-3 text-[9px] uppercase font-bold text-zinc-600 tracking-wider">
          {language}
        </span>
      )}
      
      <pre className="overflow-x-auto pt-2 whitespace-pre-wrap">{code}</pre>
    </div>
  );
}

function parseInline(text) {
  if (!text) return '';
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-text-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={index} className="italic text-text-secondary">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="bg-bg-elevated px-1.5 py-0.5 rounded text-[10px] font-mono text-primary border border-bg-border">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
