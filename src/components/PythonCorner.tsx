import React, { useState } from 'react';
import { Check, Copy, Terminal, Play } from 'lucide-react';

interface PythonCornerProps {
  title: string;
  code: string;
  expectedOutput?: string;
  tag: 'runnable' | 'needs-gpu';
  explanation?: string;
}

export const PythonCorner: React.FC<PythonCornerProps> = ({
  title,
  code,
  expectedOutput,
  tag,
  explanation,
}) => {
  const [copied, setCopied] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="my-8 rounded-xl border border-slate-800 bg-slate-900/95 overflow-hidden shadow-lg">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-slate-800 bg-slate-950/70">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-xs font-semibold text-slate-200">
            Python Corner · {title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {tag === 'runnable' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
              <Play className="w-2.5 h-2.5 fill-emerald-300" />
              Runnable in Python 3.10+
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950/70 text-amber-300 border border-amber-800/60">
              Requires 24 GB GPU
            </span>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors border border-slate-700/60"
            aria-label="Copy Python code snippet"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {explanation && (
        <div className="px-4 py-2.5 text-xs text-slate-400 bg-slate-950/30 border-b border-slate-850">
          {explanation}
        </div>
      )}

      {/* Code body */}
      <div
        tabIndex={0}
        role="region"
        aria-label={`${title} Python source code`}
        className="relative p-4 overflow-x-auto text-xs font-mono leading-relaxed bg-slate-950/90 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-400"
      >
        <pre className="selection:bg-sky-500/30">
          <code>{code}</code>
        </pre>
      </div>

      {/* Output toggle if expectedOutput provided */}
      {expectedOutput && (
        <div className="border-t border-slate-800/90 bg-slate-950/60 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Terminal Output</span>
            <button
              type="button"
              onClick={() => setShowOutput(!showOutput)}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
            >
              {showOutput ? 'Hide output' : 'Show terminal output ↓'}
            </button>
          </div>
          {showOutput && (
            <pre
              tabIndex={0}
              aria-label={`${title} expected terminal output`}
              className="mt-2 p-2.5 rounded bg-black/60 border border-slate-800 text-[11px] text-emerald-400/90 font-mono overflow-x-auto focus:outline-none focus:ring-1 focus:ring-sky-400"
            >
              {expectedOutput}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};
