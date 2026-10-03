import React from 'react';
import { ExternalLink, BookOpen, AlertCircle, Award } from 'lucide-react';

export const Epilogue: React.FC = () => {
  return (
    <section id="epilogue" className="w-full py-16 px-4 sm:px-6 max-w-4xl mx-auto border-t border-slate-800">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          What This Page Didn't Show
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          The unseen training foundations, physical limits, and where to explore next.
        </p>
      </div>

      <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
        {/* Training */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <h3 className="text-base font-bold text-sky-300 mb-2 flex items-center gap-2">
            <span>1. How Did the Numbers Get There? (Training)</span>
          </h3>
          <p className="mb-3">
            Throughout this guide, we explored how an already-trained model converts tokens, calculates attention, and samples output. But where did the billions of weights come from?
          </p>
          <p className="text-slate-400">
            During training, the model started with completely random numbers. It read millions of hours of songs, attempted to guess the next word or sound slice, calculated its mathematical error (loss), and nudged its billions of parameters by tiny fractions using gradient descent. Repeating this billions of times across large GPU clusters is what forged the conceptual map and attention habits we saw.
          </p>
        </div>

        {/* Why Music is Harder than Text */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <h3 className="text-base font-bold text-amber-300 mb-2 flex items-center gap-2">
            <span>2. Why Is Generative Music So Much Harder than Text?</span>
          </h3>
          <p className="mb-3">
            In text, a model predicts about 1 to 2 words per second. In 48 kHz stereo audio, the speaker must push 96,000 distinct floating-point sample values every single second!
          </p>
          <p className="text-slate-400">
            Generating 96,000 numbers one at a time through a transformer loop would be impossibly slow. That is why modern models like YuE2 split the problem into hierarchical stages: first planning the symbolic melody and chord structure in text (ABC notation), then generating semantic phrase tokens, and finally refining continuous sound textures using parallel flow matching.
          </p>
        </div>

        {/* Limits & Hallucinations */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <h3 className="text-base font-bold text-rose-300 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>3. Fundamental Limits: Prediction vs. Musical Intent</span>
          </h3>
          <p className="mb-3">
            The model is an incredible statistical predictor, but it does not have personal experiences, lungs, or musical intent. It does not "feel" heartbreak when generating a melancholic acoustic ballad.
          </p>
          <p className="text-slate-400">
            Because it relies on probabilistic sampling, it can also produce confident nonsense: sung lyrics that slur into phonetically unrecognizable gibberish, chord transitions that clash with traditional music theory, or vocal tracks with sudden unnatural artifacts.
          </p>
        </div>

        {/* Verified Links & Citations */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-900/70">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-4">
            <Award className="w-4 h-4" />
            <span>Official Research Papers & Source Code</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <a
              href="https://huggingface.co/m-a-p/YuE2-3B"
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-emerald-600 transition-colors flex items-center justify-between group"
            >
              <div>
                <strong className="block text-slate-200 group-hover:text-emerald-300">
                  YuE2-3B Model Card
                </strong>
                <span className="text-slate-500">Hugging Face Weights & Specs</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
            </a>

            <a
              href="https://arxiv.org/abs/2609.33757"
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-emerald-600 transition-colors flex items-center justify-between group"
            >
              <div>
                <strong className="block text-slate-200 group-hover:text-emerald-300">
                  Technical Report (arXiv:2609.33757)
                </strong>
                <span className="text-slate-500">YuE2 Architecture & Evaluation</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
            </a>

            <a
              href="https://arxiv.org/abs/2503.08638"
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-emerald-600 transition-colors flex items-center justify-between group"
            >
              <div>
                <strong className="block text-slate-200 group-hover:text-emerald-300">
                  Predecessor Paper (arXiv:2503.08638)
                </strong>
                <span className="text-slate-500">YuE: Open Foundation Model</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
            </a>

            <a
              href="https://map-yue2.github.io/"
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-emerald-600 transition-colors flex items-center justify-between group"
            >
              <div>
                <strong className="block text-slate-200 group-hover:text-emerald-300">
                  Official Demo Showcase
                </strong>
                <span className="text-slate-500">Sample Generated Audio</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
