export const VISUAL_LANGUAGE = {
  colors: {
    query: {
      base: '#0284c7', // Sky 600
      light: '#38bdf8', // Sky 400
      bg: 'rgba(2, 132, 199, 0.15)',
      border: '#0ea5e9',
      text: '#38bdf8',
      name: 'Query (What am I searching for?)',
    },
    key: {
      base: '#9333ea', // Purple 600
      light: '#c084fc', // Purple 400
      bg: 'rgba(147, 51, 234, 0.15)',
      border: '#a855f7',
      text: '#c084fc',
      name: 'Key (How I advertise myself)',
    },
    value: {
      base: '#d97706', // Amber 600
      light: '#fbbf24', // Amber 400
      bg: 'rgba(217, 119, 6, 0.15)',
      border: '#f59e0b',
      text: '#fbbf24',
      name: 'Value (What info I share)',
    },
    output: {
      base: '#059669', // Emerald 600
      light: '#34d399', // Emerald 400
      bg: 'rgba(5, 150, 105, 0.15)',
      border: '#10b981',
      text: '#34d399',
      name: 'Blended Output / Result',
    },
    neutral: {
      bg: '#0f172a',
      card: '#1e293b',
      border: '#334155',
      text: '#94a3b8',
      highlight: '#f8fafc',
    },
  },
  badges: {
    illustrative: {
      bg: 'bg-amber-950/60',
      border: 'border-amber-700/50',
      text: 'text-amber-300',
      dot: 'bg-amber-400',
      label: 'Illustrative',
      defaultBlurb: 'Hand-authored numbers that clearly show the concept, not YuE2’s real weights.',
    },
    'real-small-model': {
      bg: 'bg-sky-950/60',
      border: 'border-sky-700/50',
      text: 'text-sky-300',
      dot: 'bg-sky-400',
      label: 'Real Stand-in Data',
      defaultBlurb: 'Real attention weights exported from GPT-2 small (stand-in model, not YuE2).',
    },
    'yue2-fact': {
      bg: 'bg-emerald-950/60',
      border: 'border-emerald-700/50',
      text: 'text-emerald-300',
      dot: 'bg-emerald-400',
      label: 'Fact about YuE2',
      defaultBlurb: 'Verified fact from the official YuE2 model card or technical report.',
    },
  },
};
