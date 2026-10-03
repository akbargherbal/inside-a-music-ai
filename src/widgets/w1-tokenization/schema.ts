import { z } from 'zod';

export const MetaSchema = z.object({
  id: z.string(),
  dataKind: z.enum(['illustrative', 'real-small-model', 'yue2-fact']),
  badgeText: z.string(),
  source: z.string(),
  model: z.string().nullable().optional(),
  generatedBy: z.string().nullable().optional(),
});

export const W1DataSchema = z.object({
  schemaVersion: z.literal(1),
  meta: MetaSchema,
  sampleText: z.string(),
  sampleAbc: z.string(),
  vocab: z.record(z.string(), z.number()),
});

export type W1Data = z.infer<typeof W1DataSchema>;
