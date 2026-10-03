import math
import random

candidates = ["floor", "table", "window", "light", "wall", "sink", "dream", "purple"]
logits = [3.2, 2.5, 1.8, 1.2, 0.4, -0.2, -1.5, -2.8]

def sample_token(logits, temperature=0.8, top_k=4, seed=7):
    # 1. Apply temperature
    scaled = [l / temperature for l in logits]
    # 2. Softmax
    max_s = max(scaled)
    exps = [math.exp(s - max_s) for s in scaled]
    total = sum(exps)
    probs = [e / total for e in exps]
    
    # 3. Top-k filter
    indexed = sorted(list(enumerate(probs)), key=lambda x: x[1], reverse=True)[:top_k]
    k_indices, k_probs = zip(*indexed)
    k_sum = sum(k_probs)
    renorm = [p / k_sum for p in k_probs]
    
    # 4. Deterministic roll with fixed seed
    rng = random.Random(seed)
    chosen_idx = rng.choices(k_indices, weights=renorm, k=1)[0]
    return candidates[chosen_idx], round(probs[chosen_idx], 3)

word, prob = sample_token(logits, seed=7)
print(f"Sampled: '{word}' (prob: {prob}) with seed=7")
