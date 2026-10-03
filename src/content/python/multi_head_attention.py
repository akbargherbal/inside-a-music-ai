def single_head_toy(q, k, v):
    # Simplified dot and blend
    score = sum(a * b for a, b in zip(q, k))
    return [score * x for x in v]

def multi_head_attention(queries, keys, values, num_heads=4):
    head_outputs = []
    for h in range(num_heads):
        # Each head has distinct projections (toy mock slices)
        out_h = single_head_toy(queries[h], keys[h], values[h])
        head_outputs.append(out_h)
    
    # Concatenate: join all head outputs end-to-end
    combined_vector = []
    for out in head_outputs:
        combined_vector.extend(out)
    return combined_vector

# 4 heads with 2 dimensions each
q_heads = [[0.8, 0.2], [0.1, 0.9], [0.5, 0.5], [0.3, 0.7]]
k_heads = [[0.9, 0.1], [0.2, 0.8], [0.6, 0.4], [0.4, 0.6]]
v_heads = [[1.0, 0.0], [0.0, 1.0], [1.0, 1.0], [0.5, 0.5]]

combined = multi_head_attention(q_heads, k_heads, v_heads, num_heads=4)
print("Heads count:       ", 4)
print("Output dimensions: ", len(combined))
print("Combined vector:   ", [round(x, 2) for x in combined])
