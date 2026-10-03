import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, HelpCircle, RotateCcw } from 'lucide-react';

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

interface QuizProps {
  sectionId: string;
  questions: QuizQuestion[];
}

export const Quiz: React.FC<QuizProps> = ({ sectionId, questions }) => {
  const storageKey = `quiz-progress-${sectionId}`;

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(selectedAnswers));
    } catch {
      // storage unavailable
    }
  }, [selectedAnswers, storageKey]);

  const handleSelect = (qIdx: number, optIdx: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [qIdx]: optIdx,
    }));
  };

  const handleReset = () => {
    setSelectedAnswers({});
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = questions.filter(
    (q, idx) => selectedAnswers[idx] === q.answerIndex
  ).length;

  return (
    <div className="my-10 p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-md">
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
          <HelpCircle className="w-4 h-4" />
          <span>Quick Check: Test Your Intuition</span>
        </div>

        {answeredCount > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">
              Score: <strong className="text-sky-300">{correctCount}</strong> / {questions.length}
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const selected = selectedAnswers[qIdx];
          const hasAnswered = selected !== undefined;
          const isCorrect = selected === q.answerIndex;

          return (
            <div key={qIdx} className="space-y-3">
              <p className="text-sm font-medium text-slate-200">
                <span className="font-mono text-sky-400 mr-1.5">{qIdx + 1}.</span>
                {q.question}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((option, optIdx) => {
                  const isThisSelected = selected === optIdx;
                  const isThisCorrect = optIdx === q.answerIndex;

                  let btnStyle = 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800/80 hover:text-white';
                  if (hasAnswered) {
                    if (isThisCorrect) {
                      btnStyle = 'border-emerald-600 bg-emerald-950/40 text-emerald-200 font-medium';
                    } else if (isThisSelected) {
                      btnStyle = 'border-rose-600 bg-rose-950/40 text-rose-200 font-medium';
                    } else {
                      btnStyle = 'border-slate-850 bg-slate-950/30 text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelect(qIdx, optIdx)}
                      className={`text-left p-3 rounded-lg border text-xs leading-relaxed transition-all flex items-start gap-2 ${btnStyle}`}
                    >
                      <span className="font-mono text-slate-400 shrink-0">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <span className="flex-1">{option}</span>
                      {hasAnswered && isThisCorrect && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      {hasAnswered && isThisSelected && !isThisCorrect && (
                        <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {hasAnswered && (
                <div
                  className={`p-3 rounded-lg text-xs leading-relaxed border ${
                    isCorrect
                      ? 'bg-emerald-950/30 border-emerald-900/60 text-emerald-300'
                      : 'bg-amber-950/30 border-amber-900/60 text-amber-300'
                  }`}
                >
                  <strong className="block mb-1 font-semibold">
                    {isCorrect ? '✓ Spot on!' : '✕ Not quite — here is why:'}
                  </strong>
                  <span>{q.explanation}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
