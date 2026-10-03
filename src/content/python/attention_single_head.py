import math

tokens = ["The", "singer", "dropped", "the", "guitar",
          "because", "it", "was", "heavy"]

# Query for "it" (position 6) and the 9 Keys used by the widget
q_it = [0.85, 0.10, 0.40, 0.90]
keys = [
    [0.10, 0.05, 0.20, 0.10], # The
    [0.40, 0.70, 0.30, 0.20], # singer
    [0.20, 0.30, 0.80, 0.10], # dropped
    [0.15, 0.06, 0.18, 0.12], # the
    [0.80, 0.15, 0.35, 0.95], # guitar
    [0.12, 0.08, 0.55, 0.25], # because
    [0.20, 0.15, 0.25, 0.30], # it
    [0.18, 0.22, 0.28, 0.20], # was
    [0.65, 0.12, 0.68, 0.60], # heavy
]

def dot_product(a, b):
    return sum(x * y for x, y in zip(a, b))

def softmax(scores):
    top = max(scores)
    exps = [math.exp(s - top) for s in scores]
    total = sum(exps)
    return [e / total for e in exps]

scale = math.sqrt(len(q_it)) # sqrt(d_k)
raw_scores = [dot_product(q_it, k) / scale for k in keys]
weights = softmax(raw_scores)
winner = weights.index(max(weights))

print("Weights %:", [round(w * 100, 1) for w in weights])
print("Winner:   ", tokens[winner], "=", str(round(weights[winner] * 100, 1)) + "%")
