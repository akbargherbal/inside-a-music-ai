# Rubber-Duck Comprehension Verification

This document verifies that a junior Python developer can answer all 8 core conceptual questions using **only** the content and widgets on this page.

---

### Question 1: Why does a computer split words into sub-word tokens instead of keeping whole words or single letters?
- **Answer:** If every word were its own token, the vocabulary dictionary would need millions of entries and would still fail on new compound words or typos. If every letter were a token, sequences would be extremely long and computationally expensive. Sub-word tokens strike the optimal balance: common words stay whole, while rare or compound words are built from familiar pieces.
- **Where it appears:** Section 1 (Tokenization), Step 1 & Step 2, and Quiz Question 1.

---

### Question 2: Why do we convert token IDs into vectors of numbers (embeddings)?
- **Answer:** An integer ID like 204 has no mathematical relationship to 210. Turning tokens into lists of numbers (vectors) places them onto a high-dimensional concept map where distance corresponds to similarity: musical instruments cluster together, while emotions cluster elsewhere.
- **Where it appears:** Section 2 (Embeddings), Step 0, Step 2, and Step 4.

---

### Question 3: In "The singer dropped the guitar because it was heavy", why does "it" get a high attention weight on "guitar"?
- **Answer:** Token "it" emits a Query vector searching for a physical object. The Key vector of "guitar" matches that Query closely. Their dot product produces the highest numerical score among candidates; softmax converts that score into the largest percentage (~33% to 58%), causing "it" to absorb the Value features of "guitar".
- **Where it appears:** Section 3 (Self-Attention), Step 3, Step 4, and Step 5.

---

### Question 4: What is a "causal mask" and why is it necessary during song generation?
- **Answer:** A causal mask zeroes out (or sets to -infinity) attention connections to any tokens located ahead in the sequence. It prevents the model from "peeking into the future" so it only predicts forward, mirroring real-time playback and generation.
- **Where it appears:** Section 3 (Self-Attention), Step 7, and Quiz Question 2.

---

### Question 5: Why do transformers use multiple attention heads instead of one big head?
- **Answer:** A single head can only compute one type of relevance at a time. Multi-head attention runs several independent attention views in parallel, allowing the model to simultaneously track grammar, rhyming schemes, musical meter, and subject-verb relationships.
- **Where it appears:** Section 4 (Multi-Head Attention), Step 1, Step 3, and Step 5.

---

### Question 6: What does a "residual connection" (the conveyor shortcut) do in a transformer block?
- **Answer:** It adds the layer's input directly to its output: `x = x + attention(x)`. This shortcut lane prevents original token representations from getting distorted or erased as they pass through dozens of stacked layers.
- **Where it appears:** Section 5 (The Transformer Block), Step 3, and Quiz Question 1.

---

### Question 7: What does "temperature" control during next-token sampling?
- **Answer:** Temperature scales logits before softmax. A low temperature (e.g. 0.2) sharpens the distribution so the top choice almost always wins (conservative/safe). A high temperature (e.g. 1.5) flattens the distribution, giving less likely words a fighting chance (adventurous/creative).
- **Where it appears:** Section 6 (Choosing the Next Token), Step 2, and Quiz Question 1.

---

### Question 8: Why does the exact same seed always reproduce the exact same song?
- **Answer:** Random number generators on computers are pseudorandom; they use a deterministic mathematical sequence. Initializing the generator with the identical integer seed guarantees the exact same sequence of dice rolls across every autoregressive step.
- **Where it appears:** Section 6 (Choosing the Next Token), Step 5, and Section 7 (The Generation Loop), Step 4.
