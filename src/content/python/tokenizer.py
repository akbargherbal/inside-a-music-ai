vocab = {
    "Sun": 101, "light": 102, " on": 103,
    " the": 104, " kitchen": 105, " floor": 106
}

text = "Sunlight on the kitchen floor"
tokens = []
cursor = 0

# Greedily match longest known vocabulary piece
while cursor < len(text):
    matched = False
    for piece in sorted(vocab.keys(), key=len, reverse=True):
        if text.startswith(piece, cursor):
            tokens.append(piece)
            cursor += len(piece)
            matched = True
            break
    if not matched:
        tokens.append(text[cursor])
        cursor += 1

token_ids = [vocab.get(t, -1) for t in tokens]
print("Tokens:", tokens)
print("IDs:   ", token_ids)
