import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const pathStatusSchema = z.enum(["draft", "published"]);
export const pathPricingSchema = z.enum(["free", "paid"]);

const slugField = z
  .string()
  .min(1)
  .max(100)
  .regex(slugPattern, "slug 只能用小写字母、数字和连字符");

export const pathCreateSchema = z.object({
  slug: slugField.optional(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  estimatedHours: z.number().positive().max(1000).default(2),
  level: z.string().max(50).default("Beginner"),
  category: z.string().max(100).default("AI Engineering"),
  categoryId: z.string().min(1).optional().nullable(),
  badge: z.string().max(80).optional().nullable(),
  pricing: pathPricingSchema.default("free"),
  priceLabel: z.string().max(50).optional().nullable(),
  statusLabel: z.string().max(80).optional().nullable(),
  highlights: z.array(z.string().max(200)).default([]),
  accent: z.string().max(50).optional().nullable(),
  coverUrl: z
    .string()
    .max(500)
    .optional()
    .nullable()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : null)),
  tags: z.array(z.string().min(1).max(24)).max(20).default([]),
  ribbon: z.enum(["精品", "推荐", "新品", "热门", "付费"]).optional().nullable(),
  status: pathStatusSchema.default("draft"),
  sortOrder: z.number().int().default(0),
});

export type PathCreate = z.infer<typeof pathCreateSchema>;

export const pathUpdateSchema = pathCreateSchema.partial().extend({
  slug: slugField.optional(),
});
export type PathUpdate = z.infer<typeof pathUpdateSchema>;
