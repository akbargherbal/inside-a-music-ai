import { z } from 'zod';
import { MetaSchema } from '../w1-tokenization/schema';

export const HeadLabelSchema = z.object({
  id: z.number(),
  name: z.string(),
  blurb: z.string(),
  color: z.string(),
});

export const W4DataSchema = z
  .object({
    schemaVersion: z.literal(1),
    meta: MetaSchema,
    tokens: z.array(z.string()),
    headsCount: z.number(),
    causal: z.boolean().optional(),
    headLabels: z.array(HeadLabelSchema),
    weights: z.array(z.array(z.array(z.number()))), // [head][query][key]
  })
  .superRefine((data, ctx) => {
    // Build Spec §6.3: every attention row sums to 1 (±1e-6), values in [0,1],
    // and when causal is declared, no weight may point to a future key.
    data.weights.forEach((head, h) => {
      head.forEach((row, q) => {
        const sum = row.reduce((a, b) => a + b, 0);
        if (Math.abs(sum - 1) > 1e-6) {
          ctx.addIssue({
            code: 'custom',
            message: `head ${h} query row ${q} sums to ${sum}, expected 1`,
          });
        }
        row.forEach((value, k) => {
          if (value < 0 || value > 1) {
            ctx.addIssue({
              code: 'custom',
              message: `head ${h} row ${q} col ${k} = ${value} is outside [0,1]`,
            });
          }
          if (data.causal && k > q && value !== 0) {
            ctx.addIssue({
              code: 'custom',
              message: `causal violation: head ${h} row ${q} col ${k} = ${value}`,
            });
          }
        });
      });
    });
  });

export type HeadLabel = z.infer<typeof HeadLabelSchema>;
export type W4Data = z.infer<typeof W4DataSchema>;
