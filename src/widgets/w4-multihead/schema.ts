import { z } from 'zod';
import { MetaSchema } from '../w1-tokenization/schema';

export const HeadLabelSchema = z.object({
  id: z.number(),
  name: z.string(),
  blurb: z.string(),
  color: z.string(),
});

export const W4DataSchema = z.object({
  schemaVersion: z.literal(1),
  meta: MetaSchema,
  tokens: z.array(z.string()),
  headsCount: z.number(),
  headLabels: z.array(HeadLabelSchema),
  weights: z.array(z.array(z.array(z.number()))), // [head][query][key]
});

export type HeadLabel = z.infer<typeof HeadLabelSchema>;
export type W4Data = z.infer<typeof W4DataSchema>;
