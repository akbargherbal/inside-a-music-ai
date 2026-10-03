import { z } from 'zod';
import { MetaSchema } from '../w1-tokenization/schema';

export const EmbeddingItemSchema = z.object({
  id: z.number(),
  token: z.string(),
  vector: z.array(z.number()), // 8-dim
  coords2D: z.tuple([z.number(), z.number()]), // [x, y] in [-100, 100]
  category: z.enum(['instrument', 'structure', 'emotion', 'kitchen']),
});

export const W2DataSchema = z.object({
  schemaVersion: z.literal(1),
  meta: MetaSchema,
  items: z.array(EmbeddingItemSchema),
});

export type EmbeddingItem = z.infer<typeof EmbeddingItemSchema>;
export type W2Data = z.infer<typeof W2DataSchema>;
