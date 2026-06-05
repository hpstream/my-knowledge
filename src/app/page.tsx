import Link from "next/link";
import { getFreePaths } from "@/lib/content";
import { isStale, listPublishedTopics } from "@/lib/articles";
import { FoundationCard } from "@/components/home/FoundationCard";
import { StartReadingCta } from "@/components/home/StartReadingCta";

const PAIN_ITEMS = [
  {
    code: "×01",
    title: "API Key 在哪里申请",
    note: "OpenAI 国内不能直接用，DeepSeek 实名要怎么做",
  },
  {
    code: "×02",
    title: "域名怎么备案、备案要多久",
    note: "阿里云、腾讯云走哪个？要不要营业执照？",
  },
  {
    code: "×03",
    title: "AI 给的代码跑不通",
    note: "你问它，它换了一份；再问，越改越乱",
  },
  {
    code: "×04",
    title: "部署的时候卡死了",
    note: "白名单 IP、HTTPS、回调域名 …… 每一步都是新名词",
  },
];

const TRACKS = [
  {
    number: "01",
    tag: "基础",
    title: "基础认知",
    subtitle: "免费",
    text: "建立 AI 时代独立做产品的世界观。不教你写代码，教你看清边界、选对工具、避免常见误区。",
    cta: "开始阅读",
    href: "#foundations",
    accent: "var(--marker)",
    available: true,
  },
  {
    number: "02",
    tag: "专题",
    title: "专题攻略",
    subtitle: "免费试运行",
    text: "针对一个具体卡点，给现成方案：准备清单、申请入口、可复制的 AI 提示词、出错时的回退 prompt。",
    cta: "浏览专题",
    href: "#latest",
    accent: "var(--stamp-red)",
    available: true,
  },
  {
    number: "03",
    tag: "实战",
    title: "实战项目",
    subtitle: "即将推出",
    text: "3-7 天上线一个完整可收钱的产品。把多个专题串成端到端的实战课，含项目模板。",
    cta: "敬请期待",
    href: "#",
    accent: "var(--ink-faint)",
    available: false,
  },
];

const FIT_ITEMS = [
  "你有产品想法，但卡在「不会写代码」",
  "你试过让 AI 写代码，跑不通就崩溃",
  "你想上线，但卡在域名 / 部署 / 各种账号配置",
  "你想做副业、做超级个体，缺一份现成的清单",
];

export default async function Home() {
  const [freePaths, topics] = await Promise.all([
    getFreePaths(),
    listPublishedTopics(),
  ]);
  const firstPath = freePaths[0]?.slug ?? null;
  const featuredTopics = topics.slice(0, 6);

  return (
    <div className="text-ink">
      {/* ============================================
          HERO — big confident typography
         ============================================ */}
      <section className="relative overflow-hidden border-b border-ink">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 top-12 hidden font-mono text-[160px] font-black uppercase tracking-tighter text-ink/[0.035] lg:block"
        >
          SOLO
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pt-14 pb-20 lg:px-10 lg:pt-20 lg:pb-28">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:gap-16">
            <div className="max-w-3xl">
              <div className="ink-rise flex flex-wrap items-center gap-3">
                <span className="field-stamp field-stamp-solid">
                  <span className="font-cjk-serif">创刊号</span>
                </span>
                <span className="font-cjk-serif text-sm text-ink-muted">
                  / 给你的下一个想法
                </span>
              </div>

              <h1 className="ink-rise delay-100 mt-7 font-display font-black leading-[0.95] tracking-display text-ink">
                <span className="font-cjk-serif text-[clamp(4.5rem,12vw,9.5rem)]">
                  超级个体
                </span>
              </h1>

              <p className="ink-rise delay-300 mt-10 max-w-2xl font-display text-[clamp(1.7rem,3.6vw,2.8rem)] font-semibold leading-[1.2] tracking-display text-ink">
                <span className="font-cjk-serif">不教你</span>
                <span className="font-cjk-serif text-ink-faint">「打螺丝」</span>
                <span className="font-cjk-serif">。</span>
                <br />
                <span className="font-cjk-serif">教你</span>
                <span className="font-cjk-serif marker-yellow">「开车走人」</span>
                <span className="font-cjk-serif">。</span>
              </p>

              <p className="ink-rise delay-400 mt-8 max-w-xl font-cjk-serif text-base leading-relaxed text-ink-soft md:text-lg">
                想法到上线之间隔着几十个非代码门槛 ——
                账号、域名、配置、合规、AI 的胡言乱语。
                我们把这些路全部走过、踩过、整理成清单。
                你只需要照着做。
              </p>

              <p className="ink-rise delay-500 mt-6 font-cjk-serif text-sm text-ink-muted">
                — 一个人就是一个团队 —
              </p>

              <div className="ink-rise delay-600 mt-10 flex flex-wrap items-center gap-4">
                <StartReadingCta targetPath={firstPath} />
                <Link
                  href="#latest"
                  className="group inline-flex items-center gap-2 px-6 py-3.5 text-ink transition-colors hover:text-marker"
                >
                  <span className="font-display text-lg font-semibold tracking-tight font-cjk-serif">
                    浏览专题
                  </span>
                  <span className="transition-transform group-hover:translate-y-0.5 text-lg">
                    ↓
                  </span>
                </Link>
              </div>
            </div>

            <aside className="relative hidden self-start lg:block">
              <div className="stamp-in delay-700 relative w-[260px] -rotate-[3deg]">
                <div className="field-stamp-double border-2 border-ink bg-paper p-5">
                  <div className="border-b border-ink pb-3 text-center">
                    <div className="font-cjk-serif text-xs text-ink-muted">
                      第 01 期
                    </div>
                    <div className="mt-1 font-display text-7xl font-black leading-none tracking-tight text-ink">
                      01
                    </div>
                  </div>
                  <div className="mt-3 space-y-2 text-center">
                    <div className="font-cjk-serif text-base font-bold text-ink">
                      首期 · 创刊号
                    </div>
                    <div className="rule-dot" />
                    <div className="font-cjk-serif text-xs text-ink-muted">
                      给独立开发者的<br />实战手册
                    </div>
                    <div className="rule-dot" />
                    <div className="font-cjk-serif text-xs font-semibold text-stamp-red">
                      预发布
                    </div>
                  </div>
                </div>
                <div
                  aria-hidden
                  className="absolute -bottom-5 -left-5 flex h-14 w-14 -rotate-12 items-center justify-center rounded-full bg-stamp-red text-paper shadow-md font-cjk-serif text-[11px] font-bold"
                  style={{ boxShadow: "0 6px 12px rgba(0,0,0,0.15)" }}
                >
                  <span className="text-center leading-tight">
                    印章<br />2026
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ============================================
          FIT SECTION — qualifier checklist (第二部分)
         ============================================ */}
      <section
        id="about"
        className="relative overflow-hidden border-b border-ink bg-paper-deep/40"
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:px-10 lg:py-24">
          <div>
            <div className="field-stamp inline-flex text-ink-soft">
              <span className="font-cjk-serif">适合你吗</span>
            </div>
            <h2 className="mt-5 font-display text-4xl font-bold leading-tight tracking-display text-ink lg:text-5xl">
              <span className="font-cjk-serif">看看你</span>
              <br />
              <span className="font-cjk-serif">
                是不是<span className="marker-line">这种人</span>
                <span className="font-display">：</span>
              </span>
            </h2>
            <p className="mt-6 max-w-md font-cjk-serif text-base leading-relaxed text-ink-soft">
              下面这些卡点，命中任意一条，就值得继续看下去。
            </p>

            <div className="mt-10 inline-flex items-center gap-3 border border-ink bg-paper px-5 py-3">
              <span className="font-cjk-serif text-xs text-ink-muted">
                判定
              </span>
              <span className="font-display text-base font-bold text-ink">
                <span className="font-cjk-serif">命中 ≥ 1 = </span>
                <span className="marker-yellow">你的人</span>
              </span>
            </div>
          </div>

          <ul className="space-y-5">
            {FIT_ITEMS.map((item, idx) => (
              <li
                key={item}
                className="field-card-inset group flex items-start gap-4 p-5 transition-colors hover:bg-paper-deep"
              >
                <span className="num-circle bg-paper text-ink transition-colors group-hover:bg-marker group-hover:text-paper group-hover:border-marker">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 pt-1">
                  <p className="font-cjk-serif text-lg font-medium leading-snug text-ink">
                    {item}
                  </p>
                </div>
                <span className="font-cjk-serif text-xs text-ink-faint transition-colors group-hover:text-marker">
                  ✓ 命中
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============================================
          PAIN POINTS — diagnostic page (第三部分)
         ============================================ */}
      <section className="border-b border-ink">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:gap-16">
            <div className="lg:max-w-xs">
              <div className="field-stamp inline-flex text-ink-soft">
                <span className="font-cjk-serif">问题</span>
              </div>
              <h2 className="mt-5 font-display text-4xl font-bold leading-tight tracking-display text-ink lg:text-5xl">
                <span className="font-cjk-serif">AI 会写代码。</span>
                <br />
                <span className="font-cjk-serif">
                  但<span className="marker-line">你卡在</span>这里：
                </span>
              </h2>
              <p className="mt-6 font-cjk-serif text-sm text-ink-muted">
                你放弃的四个理由
              </p>
            </div>

            <ol className="space-y-0 border-l border-ink/30 pl-6 lg:border-l-2 lg:pl-10">
              {PAIN_ITEMS.map((item, idx) => (
                <li
                  key={item.code}
                  className={`relative py-6 ${
                    idx < PAIN_ITEMS.length - 1
                      ? "border-b border-dashed border-ink/25"
                      : ""
                  }`}
                >
                  <span className="absolute -left-[2.4rem] flex h-8 w-8 -translate-y-1 items-center justify-center bg-paper font-mono text-[11px] font-bold text-stamp-red lg:-left-[2.8rem]">
                    {item.code}
                  </span>
                  <h3 className="font-display text-2xl font-semibold leading-tight tracking-tight text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-base text-ink-soft">{item.note}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-16 grid gap-6 border-t border-ink pt-10 lg:grid-cols-[auto_1fr] lg:items-end lg:gap-12">
            <div className="font-cjk-serif text-sm text-ink-muted">
              我们的<br />回答 <span className="text-stamp-red">↘</span>
            </div>
            <div>
              <p className="font-display text-3xl font-semibold leading-tight tracking-display text-ink lg:text-4xl">
                <span className="font-cjk-serif">
                  我们给你
                  <span className="marker-yellow">现成的方案</span>。
                </span>
                <span className="font-cjk-serif">照着做就行。</span>
              </p>
              <p className="mt-4 text-base text-ink-soft">
                不教你从打螺丝开始造车 ——
                教你怎么直接<span className="font-cjk-serif">把车开走</span>。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          THREE TRACKS — Foundation / Topics / Workshops
         ============================================ */}
      <section className="border-b border-ink">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="field-stamp inline-flex text-ink-soft">
                <span className="font-cjk-serif">三条轨道</span>
              </div>
              <h2 className="mt-5 font-display text-4xl font-bold tracking-display text-ink lg:text-5xl">
                <span className="font-cjk-serif">三条轨道，</span>
                <span className="font-cjk-serif">一个目标。</span>
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-ink-soft font-cjk-serif">
              从世界观到具体卡点，从单点解决到完整项目。 你可以从任意一条轨道开始，没有强制顺序。
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 lg:gap-6">
            {TRACKS.map((track, idx) => (
              <div
                key={track.number}
                className={`field-card ${
                  track.available ? "ink-shadow" : "opacity-70"
                } p-7 ${idx === 1 ? "lg:mt-6" : ""} ${idx === 2 ? "lg:mt-12" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="font-display text-7xl font-black leading-none tracking-display"
                    style={{ color: track.accent }}
                  >
                    {track.number}
                  </div>
                  <span className="font-cjk-serif text-xs text-ink-muted">
                    {track.subtitle}
                  </span>
                </div>

                <div className="mt-6 border-t border-ink/25 pt-5">
                  <div className="font-cjk-serif text-xs text-ink-muted">
                    {track.tag}
                  </div>
                  <h3 className="mt-1 font-display text-2xl font-bold leading-tight tracking-tight text-ink">
                    <span className="font-cjk-serif">{track.title}</span>
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-ink-soft font-cjk-serif">
                    {track.text}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-ink/15 pt-4">
                  {track.available ? (
                    <Link
                      href={track.href}
                      className="group inline-flex items-center gap-2 font-display text-base font-medium text-ink"
                    >
                      <span className="font-cjk-serif">{track.cta}</span>
                      <span className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  ) : (
                    <span className="font-cjk-serif text-sm font-medium text-stamp-red">
                      即将上线
                    </span>
                  )}
                  <span className="font-mono text-[10px] text-ink-faint">
                    {String(idx + 1).padStart(2, "0")} / 03
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          LATEST TOPICS — magazine TOC style (DB-backed)
         ============================================ */}
      <section id="latest" className="border-b border-ink bg-paper-deep/40">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="field-stamp inline-flex text-ink-soft">
                <span className="font-cjk-serif">本期</span>
              </div>
              <h2 className="mt-5 font-display text-4xl font-bold tracking-display text-ink lg:text-5xl">
                <span className="font-cjk-serif">本期</span>
                <span className="font-cjk-serif">
                  <span className="marker-line">专题</span>
                </span>
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-soft font-cjk-serif">
                每周 1-2 篇新专题。 每篇都标注最近更新时间，超过 60 天会自动提示「可能过期」。
              </p>
            </div>
            <Link
              href="/topics"
              className="font-cjk-serif text-sm text-ink-muted transition-colors hover:text-ink"
            >
              全部专题 →
            </Link>
          </div>

          {featuredTopics.length === 0 ? (
            <div className="field-card border-dashed p-12 text-center">
              <p className="font-cjk-serif text-lg text-ink">
                第一篇专题还在路上。 稍等几天，我们正在写。
              </p>
            </div>
          ) : (
            <>
              <ol className="border-y-2 border-ink">
                {featuredTopics.map((topic, idx) => {
                  const stale = isStale(topic.lastVerifiedAt);
                  return (
                    <li
                      key={topic.slug}
                      className={`group relative grid items-baseline gap-x-4 px-1 py-6 transition-colors hover:bg-paper md:grid-cols-[auto_1fr_auto] ${
                        idx < featuredTopics.length - 1
                          ? "border-b border-ink/30"
                          : ""
                      }`}
                    >
                      <div className="flex items-baseline gap-4">
                        <span className="font-display text-3xl font-black tracking-tight text-ink lg:text-4xl">
                          {String(idx + 1).padStart(3, "0")}
                        </span>
                        {stale && (
                          <span className="font-cjk-serif text-xs font-semibold text-stamp-red">
                            可能过期
                          </span>
                        )}
                      </div>

                      <div className="md:px-2">
                        <Link
                          href={`/topics/${topic.slug}`}
                          className="group/title block"
                        >
                          <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-ink md:text-2xl">
                            <span className="font-cjk-serif group-hover/title:underline group-hover/title:decoration-marker group-hover/title:decoration-4 group-hover/title:underline-offset-4">
                              {topic.title}
                            </span>
                          </h3>
                        </Link>
                        {topic.summary && (
                          <p className="mt-1 text-sm leading-relaxed text-ink-soft font-cjk-serif">
                            {topic.summary}
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-cjk-serif text-xs text-ink-muted">
                          {topic.difficulty != null && (
                            <span className="flex items-center gap-1.5">
                              <span className="text-marker">●</span>
                              <span>难度</span>
                              <span className="text-ink">
                                {"★".repeat(topic.difficulty)}
                                <span className="text-ink-faint">
                                  {"★".repeat(5 - topic.difficulty)}
                                </span>
                              </span>
                            </span>
                          )}
                          {(topic.estimatedMinutes ?? topic.readMinutes) && (
                            <>
                              <span className="text-ink-faint">/</span>
                              <span>
                                {topic.estimatedMinutes ?? topic.readMinutes}{" "}
                                分钟
                              </span>
                            </>
                          )}
                          {topic.cost && (
                            <>
                              <span className="text-ink-faint">/</span>
                              <span>{topic.cost}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <Link
                        href={`/topics/${topic.slug}`}
                        className="hidden md:block font-cjk-serif text-sm text-ink-muted transition-colors group-hover:text-marker"
                      >
                        阅读 →
                      </Link>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-8 flex items-center justify-between font-cjk-serif text-sm text-ink-muted">
                <span>↘ 还有更多在路上</span>
                {topics.length > featuredTopics.length && (
                  <Link href="/topics" className="hover:text-ink">
                    查看全部 {topics.length} 篇 →
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ============================================
          FOUNDATIONS — feature L1 paths
         ============================================ */}
      <section id="foundations" className="border-b border-ink">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          <div className="mb-12 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="field-stamp inline-flex text-ink-soft">
                <span className="font-cjk-serif">基础认知</span>
              </div>
              <h2 className="mt-5 font-display text-4xl font-bold tracking-display text-ink lg:text-5xl">
                <span className="font-cjk-serif">先把</span>
                <span className="font-cjk-serif">
                  <span className="marker-yellow">世界观</span>
                </span>
                <span className="font-cjk-serif">搞对。</span>
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft font-cjk-serif">
                在动手做产品之前，先理解 AI 时代独立开发者的工作方式。 这一层是免费的，也是后面所有内容的底座。
              </p>
            </div>
            <div className="text-right font-cjk-serif text-xs text-ink-muted">
              <div>{freePaths.length} 条课程</div>
              <div className="mt-1">免费</div>
            </div>
          </div>

          {freePaths.length === 0 ? (
            <div className="field-card border-dashed p-12 text-center text-ink-muted">
              暂无内容
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {freePaths.map((p, idx) => (
                <FoundationCard
                  key={p.slug}
                  path={p}
                  index={idx}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
