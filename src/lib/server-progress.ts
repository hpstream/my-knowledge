import { prisma } from "@/lib/db";

export type ServerQuizAttempt = {
  questionIndex: number;
  selectedIndex: number;
  correct: boolean;
  at: number;
};

export type ServerArticleProgress = {
  slug: string;
  attempts: ServerQuizAttempt[];
  completedAt: number | null;
  score: { correct: number; total: number } | null;
};

function rowToProgress(row: {
  lessonSlug: string;
  attemptsJson: string | null;
  completedAt: Date | null;
  scoreCorrect: number | null;
  scoreTotal: number | null;
}): ServerArticleProgress {
  let attempts: ServerQuizAttempt[] = [];
  if (row.attemptsJson) {
    try {
      const parsed = JSON.parse(row.attemptsJson);
      if (Array.isArray(parsed)) attempts = parsed as ServerQuizAttempt[];
    } catch {
      attempts = [];
    }
  }
  const score =
    row.scoreCorrect != null && row.scoreTotal != null
      ? { correct: row.scoreCorrect, total: row.scoreTotal }
      : null;
  return {
    slug: row.lessonSlug,
    attempts,
    completedAt: row.completedAt ? row.completedAt.getTime() : null,
    score,
  };
}

export async function listProgress(
  userId: string,
): Promise<Record<string, ServerArticleProgress>> {
  const rows = await prisma.userLessonProgress.findMany({
    where: { userId },
  });
  const out: Record<string, ServerArticleProgress> = {};
  for (const row of rows) {
    out[row.lessonSlug] = rowToProgress(row);
  }
  return out;
}

export async function appendAttempt(
  userId: string,
  pathSlug: string,
  lessonSlug: string,
  attempt: ServerQuizAttempt,
): Promise<ServerArticleProgress> {
  const existing = await prisma.userLessonProgress.findUnique({
    where: { userId_lessonSlug: { userId, lessonSlug } },
  });
  const prevAttempts: ServerQuizAttempt[] = existing?.attemptsJson
    ? (JSON.parse(existing.attemptsJson) as ServerQuizAttempt[])
    : [];
  const nextAttempts = [...prevAttempts, attempt];

  const upserted = await prisma.userLessonProgress.upsert({
    where: { userId_lessonSlug: { userId, lessonSlug } },
    create: {
      userId,
      pathSlug,
      lessonSlug,
      attemptsJson: JSON.stringify(nextAttempts),
    },
    update: {
      attemptsJson: JSON.stringify(nextAttempts),
    },
  });
  return rowToProgress(upserted);
}

export async function markComplete(
  userId: string,
  pathSlug: string,
  lessonSlug: string,
  score: { correct: number; total: number },
): Promise<ServerArticleProgress> {
  const upserted = await prisma.userLessonProgress.upsert({
    where: { userId_lessonSlug: { userId, lessonSlug } },
    create: {
      userId,
      pathSlug,
      lessonSlug,
      completedAt: new Date(),
      scoreCorrect: score.correct,
      scoreTotal: score.total,
    },
    update: {
      completedAt: new Date(),
      scoreCorrect: score.correct,
      scoreTotal: score.total,
    },
  });
  return rowToProgress(upserted);
}
