import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(60),
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/i, "slug 只允许字母数字和短横线"),
  sortOrder: z.number().int().default(0),
  status: z.enum(["active", "archived"]).default("active"),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();
