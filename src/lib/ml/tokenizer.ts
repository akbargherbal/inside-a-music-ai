export interface TokenChunk {
  id: number;
  text: string;
  isWordPiece?: boolean;
}

export const DEFAULT_TOY_VOCAB: Record<string, number> = {
  '<pad>': 0,
  '<unk>': 1,
  '<s>': 2,
  '</s>': 3,
  'Sun': 101,
  'light': 102,
  ' on': 103,
  ' the': 104,
  ' kitchen': 105,
  ' floor': 106,
  'The': 201,
  ' singer': 202,
  ' dropped': 203,
  ' guitar': 204,
  ' because': 205,
  ' it': 206,
  ' was': 207,
  ' heavy': 208,
  'Indie': 301,
  ' pop': 302,
  ' warm': 303,
  ' female': 304,
  ' vocal': 305,
  ' acoustic': 306,
  ' soft': 307,
  ' drums': 308,
  // Single char fallbacks
  'S': 401, 'u': 402, 'n': 403, 'l': 404, 'i': 405, 'g': 406, 'h': 407, 't': 408,
  ' ': 409, 'o': 410, 'e': 411, 'k': 412, 'c': 413, 'f': 414, 'r': 415, 'd': 416,
  'p': 417, 'a': 418, 'm': 419, 'v': 420, 'w': 421, 's': 422, 'y': 423, 'b': 424,
  // ABC musical tokens
  'X:1': 501,
  'M:4/4': 502,
  'L:1/8': 503,
  'K:C': 504,
  '|C': 505,
  'D': 506,
  'E': 507,
  'F': 508,
  'G2': 509,
  'E2|': 510,
};

export function tokenizeGreedy(
  text: string,
  vocab: Record<string, number> = DEFAULT_TOY_VOCAB
): TokenChunk[] {
  const result: TokenChunk[] = [];
  let cursor = 0;
  const sortedVocabKeys = Object.keys(vocab).sort((a, b) => b.length - a.length);

  while (cursor < text.length) {
    let matched = false;
    for (const key of sortedVocabKeys) {
      if (text.startsWith(key, cursor)) {
        result.push({
          id: vocab[key],
          text: key,
          isWordPiece: key.length < text.length,
        });
        cursor += key.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      const char = text[cursor];
      result.push({
        id: vocab[char] ?? 1,
        text: char,
        isWordPiece: true,
      });
      cursor += 1;
    }
  }

  return result;
}

/**
 * Rejoins token chunks back into the original string. Because the greedy
 * tokenizer never drops or rewrites characters, detokenize(tokenize(x)) === x.
 */
export function detokenize(chunks: TokenChunk[]): string {
  return chunks.map(chunk => chunk.text).join('');
}
