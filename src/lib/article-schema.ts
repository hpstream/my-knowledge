import { z } from "zod";
import { quizQuestionSchema } from "./types";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const slugField = z
  .string()
  .min(1)
  .max(100)
  .regex(slugPattern, "slug 只能用小写字母、数字和连字符");

export const articleStatusSchema = z.enum(["draft", "published"]);
export const articleKindSchema = z.enum(["lesson", "topic"]);

const articleBaseShape = {
  slug: slugField.optional(),
  kind: articleKindSchema.default("lesson"),
  pathSlug: z.string().min(1).max(100).optional().nullable(),
  title: z.string().min(1).max(200),
  summary: z.string().max(500).optional().nullable(),
  body: z.string().min(1),
  order: z.number().int().positive().default(1),
  readMinutes: z.number().int().positive(),
  difficulty: z.number().int().min(1).max(5).optional().nullable(),
  estimatedMinutes: z.number().int().positive().optional().nullable(),
  cost: z.string().max(80).optional().nullable(),
  coverUrl: z.string().url().max(500).optional().nullable(),
  tags: z.array(z.string().min(1).max(24)).max(20).default([]),
  ribbon: z.enum(["精品", "推荐", "新品", "热门", "付费"]).optional().nullable(),
  quiz: z.array(quizQuestionSchema).default([]),
  status: articleStatusSchema.default("draft"),
};

const articleCreateBase = z.object(articleBaseShape);

export const articleCreateSchema = articleCreateBase.superRefine((val, ctx) => {
  if (val.kind === "lesson" && (!val.pathSlug || val.pathSlug.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["pathSlug"],
      message: "lesson 类型必须指定所属路径",
    });
  }
});

export type ArticleCreate = z.infer<typeof articleCreateSchema>;

export const articleUpdateSchema = articleCreateBase.partial();
export type ArticleUpdate = z.infer<typeof articleUpdateSchema>;
