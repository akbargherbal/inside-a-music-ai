import math

# Toy 4-dimensional embeddings for concepts
embeddings = {
    "guitar":  [ 0.82,  0.41, -0.15,  0.72],
    "piano":   [ 0.75,  0.48, -0.10,  0.68],
    "drums":   [ 0.65,  0.30,  0.22,  0.80],
    "kitchen": [-0.60, -0.72,  0.85, -0.40],
    "sad":     [-0.10,  0.88, -0.75, -0.20],
}

def find_nearest(target_word, table, top_n=2):
    target_vec = table[target_word]
    distances = []
    for word, vec in table.items():
        if word == target_word:
            continue
        dist = math.dist(target_vec, vec)
        distances.append((word, round(dist, 3)))
    distances.sort(key=lambda x: x[1])
    return distances[:top_n]

print("Nearest to 'guitar':", find_nearest("guitar", embeddings))
