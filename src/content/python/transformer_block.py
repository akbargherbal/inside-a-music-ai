def add_vectors(a, b):
    return [x + y for x, y in zip(a, b)]

def normalize(vec):
    # Toy mean-zero normalisation (subtract the average, keep the shape)
    mean = sum(vec) / len(vec)
    return [round(x - mean, 3) for x in vec]

def toy_self_attention(x):
    # Tokens share information (stub toy blend)
    return [0.15, -0.20, 0.35, 0.10]

def toy_feed_forward(x):
    # Token processes its own state privately
    return [round(val * 1.5, 3) for val in x]

# Input token vector
x = [0.80, -0.40, 0.20, 0.50]

# 1. Attention with Residual Shortcut: x = x + Attention(x)
attn_out = toy_self_attention(x)
x = add_vectors(x, attn_out)

# 2. Normalisation
x = normalize(x)

# 3. Feed-Forward with Residual Shortcut: x = x + FFN(x)
ffn_out = toy_feed_forward(x)
x = add_vectors(x, ffn_out)

# 4. Final Normalisation
x = normalize(x)

print("Output representation:", x)
