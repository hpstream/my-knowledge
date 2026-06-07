import { z } from "zod";

export const quizQuestionSchema = z.object({
  q: z.string(),
  options: z.array(z.string()).min(2).max(6),
  answer: z.number().int().nonnegative(),
  explanation: z.string(),
});

export const articleFrontmatterSchema = z.object({
  title: z.string(),
  slug: z.string(),
  pathSlug: z.string(),
  order: z.number().int().positive(),
  readMinutes: z.number().int().positive(),
  summary: z.string().optional(),
  quiz: z.array(quizQuestionSchema).default([]),
});

export const learningPathSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  estimatedHours: z.number().positive(),
  lessonSlugs: z.array(z.string()).optional().default([]),
  level: z.string().default("Beginner"),
  category: z.string().default("AI Engineering"),
  badge: z.string().optional(),
  pricing: z.enum(["free", "paid"]).default("free"),
  priceLabel: z.string().optional(),
  statusLabel: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  accent: z.string().optional(),
  coverUrl: z.string().optional(),
  tags: z.array(z.string()).default([]),
  ribbon: z.string().optional(),
});

export const marketingCourseSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  level: z.string(),
  category: z.string(),
  lessonCount: z.number().int().positive(),
  estimatedHours: z.number().positive(),
  priceLabel: z.string(),
  badge: z.string().optional(),
  statusLabel: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  accent: z.string().optional(),
});

export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>;
export type LearningPath = z.infer<typeof learningPathSchema>;
export type MarketingCourse = z.infer<typeof marketingCourseSchema>;

export type Article = {
  frontmatter: ArticleFrontmatter;
  body: string;
};

