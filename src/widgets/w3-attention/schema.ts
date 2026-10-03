import { z } from 'zod';
import { MetaSchema } from '../w1-tokenization/schema';

export const TokenQKVVectorSchema = z.object({
  token: z.string(),
  id: z.number(),
  q: z.array(z.number()), // 4-dim
  k: z.array(z.number()), // 4-dim
  v: z.array(z.number()), // 4-dim
});

export const W3DataSchema = z.object({
  schemaVersion: z.literal(1),
  meta: MetaSchema,
  sentence: z.string(),
  tokens: z.array(TokenQKVVectorSchema),
});

export type TokenQKV = z.infer<typeof TokenQKVVectorSchema>;
export type W3Data = z.infer<typeof W3DataSchema>;
