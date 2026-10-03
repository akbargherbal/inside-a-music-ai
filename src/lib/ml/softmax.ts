/**
 * Numerically stable softmax with optional temperature.
 * Subtracts max value to avoid overflow with large exponents.
 */
export function softmax(logits: number[], temperature = 1.0): number[] {
  if (logits.length === 0) return [];
  const temp = Math.max(temperature, 1e-4);
  const scaled = logits.map(l => l / temp);
  const max = Math.max(...scaled);
  const exps = scaled.map(l => Math.exp(l - max));
  const sum = exps.reduce((acc, val) => acc + val, 0);
  if (sum === 0) {
    return logits.map(() => 1 / logits.length);
  }
  return exps.map(e => e / sum);
}
