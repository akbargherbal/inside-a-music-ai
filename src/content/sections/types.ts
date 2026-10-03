import type { DataKind } from '../../components/DataBadge';

export interface ConceptStep {
  caption: string; // <= 40 words, plain language
  liveCaption: string; // aria-live description
  newTerms?: string[];
}

export interface PythonSnippet {
  title: string;
  file: string;
  code: string;
  expectedOutput?: string;
  explanation?: string;
  tag: 'runnable' | 'needs-gpu';
}

export interface ConceptSection {
  id: 'tokenization' | 'embeddings' | 'attention' | 'multihead' | 'block' | 'sampling' | 'loop';
  title: string;
  subtitle: string;
  hook: string; // <= 25 words
  analogy: {
    title: string;
    body: string;
    breaksDown: string; // REQUIRED
  };
  dataKind: DataKind;
  badgeCustomText?: string;
  steps: ConceptStep[];
  inYuE2: {
    text: string;
    factIds: string[];
  };
  pythonCorner: PythonSnippet[];
  recap: string[]; // exactly 3 bullets
  quiz: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  }[]; // exactly 2 questions
}
