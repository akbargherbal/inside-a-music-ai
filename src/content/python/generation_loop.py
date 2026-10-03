import random

# Toy transition probability table (next word options)
transitions = {
    "the":     ["kitchen", "room"],
    "kitchen": ["floor", "table"],
    "floor":   ["glows", "creaks"],
    "glows":   ["<end>"],
    "creaks":  ["<end>"],
}

def generate_song_line(prompt=["Sunlight", "on", "the"], seed=2):
    rng = random.Random(seed)
    tokens = list(prompt)
    
    while tokens[-1] != "<end>" and len(tokens) < 8:
        last = tokens[-1]
        options = transitions.get(last, ["<end>"])
        next_token = rng.choice(options)
        tokens.append(next_token)
        
    return " ".join(tokens[:-1]) # Strip <end>

result = generate_song_line(seed=2)
print("Generated line:", result)
