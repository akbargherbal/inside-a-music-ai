import { z } from 'zod';
import { MetaSchema } from '../w1-tokenization/schema';

export const CandidateItemSchema = z.object({
  id: z.number(),
  token: z.string(),
  logit: z.number(),
  uncondLogit: z.number().optional(), // For CFG guidance
});

export const W6DataSchema = z.object({
  schemaVersion: z.literal(1),
  meta: MetaSchema,
  contextPhrase: z.string(),
  candidates: z.array(CandidateItemSchema),
});

export type CandidateItem = z.infer<typeof CandidateItemSchema>;
export type W6Data = z.infer<typeof W6DataSchema>;
