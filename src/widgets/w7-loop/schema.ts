import { z } from 'zod';
import { MetaSchema } from '../w1-tokenization/schema';

export const LoopStepRecordSchema = z.object({
  stepNumber: z.number(),
  inputContext: z.array(z.string()),
  sampledToken: z.string(),
  isStopToken: z.boolean().optional(),
  probabilities: z.array(
    z.object({
      token: z.string(),
      prob: z.number(),
    })
  ),
});

export const W7DataSchema = z.object({
  schemaVersion: z.literal(1),
  meta: MetaSchema,
  prompt: z.array(z.string()),
  scriptedSteps: z.array(LoopStepRecordSchema),
});

export type LoopStepRecord = z.infer<typeof LoopStepRecordSchema>;
export type W7Data = z.infer<typeof W7DataSchema>;
