import Link from "next/link";
import { isStale, listPublishedTopics } from "@/lib/articles";

export const dynamic = "force-dynamic";

function difficultyStars(d: number | null): string {
  if (!d) return "";
  const n = Math.max(0, Math.min(5, d));
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function TopicsIndexPage() {
  const topics = await listPublishedTopics();

  return (
    <div className="text-ink">
      <section className="border-b border-ink">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="field-stamp inline-flex text-ink-soft">
                <span className="font-cjk-serif">全部专题</span>
              </div>
              <h1 className="mt-5 font-display text-5xl font-black tracking-display text-ink lg:text-6xl">
                <span className="font-cjk-serif">专题</span>
                <span className="font-cjk-serif">
                  <span className="marker-yellow">攻略</span>
                </span>
              </h1>
              <p className="mt-6 font-cjk-serif text-base leading-relaxed text-ink-soft">
                解决一个具体卡点：准备清单、申请入口、可复制的 AI
                提示词、出错时的回退 prompt。 现成方案，照着做就行。
              </p>
            </div>
            <div className="text-right font-cjk-serif text-sm text-ink-muted">
              <div>共 {topics.length} 篇</div>
              <div className="mt-1">全部免费</div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-ink bg-paper-deep/30">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-20">
          {topics.length === 0 ? (
            <div className="field-card border-dashed p-16 text-center">
              <h2 className="font-display text-2xl font-bold text-ink">
                <span className="font-cjk-serif">第一篇专题</span>
                <span className="font-cjk-serif">还在路上</span>
              </h2>
              <p className="mt-3 text-sm text-ink-soft">
                我们正在写第一批专题：接入 AI 聊天、项目部署、邮箱登录。
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 border border-ink bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                <span>← 回首页看看基础认知</span>
              </Link>
            </div>
          ) : (
            <ol className="border-y-2 border-ink">
              {topics.map((t, idx) => {
                const stale = isStale(t.lastVerifiedAt);
                return (
                  <li
                    key={t.slug}
                    className={`group relative grid items-baseline gap-x-4 px-1 py-7 transition-colors hover:bg-paper md:grid-cols-[auto_1fr_auto] ${
                      idx < topics.length - 1
                        ? "border-b border-ink/30"
                        : ""
                    }`}
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="font-display text-3xl font-black tracking-tight text-ink lg:text-4xl">
                        {String(idx + 1).padStart(3, "0")}
                      </span>
                    </div>

                    <div className="md:px-2">
                      <Link
                        href={`/topics/${t.slug}`}
                        className="group/title block"
                      >
                        <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-ink md:text-2xl">
                          <span className="font-cjk-serif group-hover/title:underline group-hover/title:decoration-marker group-hover/title:decoration-4 group-hover/title:underline-offset-4">
                            {t.title}
                          </span>
                        </h3>
                      </Link>
                      {t.summary && (
                        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                          {t.summary}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-cjk-serif text-xs text-ink-muted">
                        {t.difficulty != null && (
                          <span className="flex items-center gap-1.5">
                            <span className="text-marker">●</span>
                            <span>难度</span>
                            <span className="text-ink">
                              {difficultyStars(t.difficulty).slice(
                                0,
                                t.difficulty,
                              )}
                              <span className="text-ink-faint">
                                {difficultyStars(t.difficulty).slice(
                                  t.difficulty,
                                )}
                              </span>
                            </span>
                          </span>
                        )}
                        {(t.estimatedMinutes ?? t.readMinutes) && (
                          <>
                            <span className="text-ink-faint">/</span>
                            <span>
                              {t.estimatedMinutes ?? t.readMinutes} 分钟
                            </span>
                          </>
                        )}
                        {t.cost && (
                          <>
                            <span className="text-ink-faint">/</span>
                            <span>{t.cost}</span>
                          </>
                        )}
                        {t.lastVerifiedAt && (
                          <>
                            <span className="text-ink-faint">/</span>
                            <span>
                              {stale ? (
                                <span className="text-stamp-red font-bold">
                                  可能过期
                                </span>
                              ) : (
                                `已验证 ${fmtDate(t.lastVerifiedAt)}`
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/topics/${t.slug}`}
                      className="hidden md:block font-cjk-serif text-sm text-ink-muted transition-colors group-hover:text-marker"
                    >
                      阅读 →
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
}
