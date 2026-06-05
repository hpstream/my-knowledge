"use client";

export type QuizAttempt = {
  questionIndex: number;
  selectedIndex: number;
  correct: boolean;
  at: number;
};

export type ArticleProgress = {
  slug: string;
  attempts: QuizAttempt[];
  completedAt: number | null;
  score: { correct: number; total: number } | null;
};

const UPDATE_EVENT = "mk:progress-updated";
export const PROGRESS_UPDATE_EVENT = UPDATE_EVENT;

let cache: Record<string, ArticleProgress> | null = null;
let inflight: Promise<Record<string, ArticleProgress>> | null = null;

function notify(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

type RawProgress = Omit<ArticleProgress, "completedAt"> & {
  completedAt: number | string | null;
};

function normalize(
  raw: Record<string, RawProgress>,
): Record<string, ArticleProgress> {
  const out: Record<string, ArticleProgress> = {};
  for (const [k, v] of Object.entries(raw)) {
    let completedAt: number | null = null;
    if (typeof v.completedAt === "number") {
      completedAt = v.completedAt;
    } else if (typeof v.completedAt === "string") {
      const parsed = Date.parse(v.completedAt);
      completedAt = Number.isNaN(parsed) ? null : parsed;
    }
    out[k] = {
      slug: v.slug,
      attempts: Array.isArray(v.attempts) ? v.attempts : [],
      completedAt,
      score: v.score ?? null,
    };
  }
  return out;
}

async function fetchProgress(): Promise<Record<string, ArticleProgress>> {
  if (typeof window === "undefined") return {};
  try {
    const res = await fetch("/api/progress", { cache: "no-store" });
    if (!res.ok) return {};
    const raw = (await res.json()) as Record<string, RawProgress>;
    return normalize(raw);
  } catch {
    return {};
  }
}

export async function loadAllProgress(): Promise<Record<string, ArticleProgress>> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    const next = await fetchProgress();
    cache = next;
    inflight = null;
    return next;
  })();
  return inflight;
}

export function getAllProgress(): Record<string, ArticleProgress> {
  return cache ?? {};
}

export function invalidateProgressCache(): void {
  cache = null;
  inflight = null;
}

export async function recordAttempt(
  pathSlug: string,
  lessonSlug: string,
  attempt: QuizAttempt,
): Promise<ArticleProgress | null> {
  try {
    const res = await fetch("/api/progress/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pathSlug, lessonSlug, attempt }),
    });
    if (!res.ok) return null;
    const raw = (await res.json()) as RawProgress;
    const updated = normalize({ [lessonSlug]: raw })[lessonSlug];
    if (cache) cache[lessonSlug] = updated;
    notify();
    return updated;
  } catch {
    return null;
  }
}

export async function completeQuiz(
  pathSlug: string,
  lessonSlug: string,
  score: { correct: number; total: number },
): Promise<ArticleProgress | null> {
  try {
    const res = await fetch("/api/progress/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pathSlug, lessonSlug, score }),
    });
    if (!res.ok) return null;
    const raw = (await res.json()) as RawProgress;
    const updated = normalize({ [lessonSlug]: raw })[lessonSlug];
    if (cache) cache[lessonSlug] = updated;
    notify();
    return updated;
  } catch {
    return null;
  }
}
