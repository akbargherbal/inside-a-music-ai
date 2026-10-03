import { z } from 'zod';
import { MetaSchema } from '../w1-tokenization/schema';

export const StationSchema = z.object({
  id: z.string(),
  name: z.string(),
  stepIndex: z.number(),
  shortDesc: z.string(),
  inputShape: z.string(),
  outputShape: z.string(),
  analogyStation: z.string(),
  details: z.string(),
});

export const W5DataSchema = z.object({
  schemaVersion: z.literal(1),
  meta: MetaSchema,
  stations: z.array(StationSchema),
});

export type Station = z.infer<typeof StationSchema>;
export type W5Data = z.infer<typeof W5DataSchema>;
