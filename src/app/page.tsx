import Link from "next/link";
import { getFreePaths } from "@/lib/content";
import { isStale, listPublishedTopics } from "@/lib/articles";
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

const FIT_ITEMS = [
  "你有产品想法，但卡在「不会写代码」",
  "你试过让 AI 写代码，跑不通就崩溃",
  "你想上线，但卡在域名 / 部署 / 各种账号配置",
  "你想做副业、做超级个体，缺一份现成的清单",
];

const DIFFERENCE_POINTS = [
  "不教你从打螺丝开始学编程，而是先把事情跑通",
  "每篇内容都告诉你：先准备什么、去哪里申请、怎么验证",
  "重点解决“为什么我和 AI 来回问，却还是做不成”的卡点",
  "先免费把内容做厚、把路径做顺，再考虑收费",
];

function featuredPathSlug(paths: Awaited<ReturnType<typeof getFreePaths>>) {
  return paths.find((p) => p.slug === "launch-your-first-site")?.slug ?? null;
}

function foundationsSlug(paths: Awaited<ReturnType<typeof getFreePaths>>) {
  return paths.find((p) => p.slug === "vibecoding-getting-started")?.slug ?? null;
}

export default async function Home() {
  const [freePaths, topics] = await Promise.all([
    getFreePaths(),
    listPublishedTopics(),
  ]);

  const pathA = foundationsSlug(freePaths);
  const pathB = featuredPathSlug(freePaths);
  const featuredTopics = topics.slice(0, 6);

  return (
    <div className="text-ink">
      {/* ============================================
          HERO
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
                你不需要从头学会所有技术。你需要的是：知道先准备什么、去哪里申请、按什么顺序做，然后把这些一次性交给 AI 帮你完成。
              </p>

              <p className="ink-rise delay-500 mt-6 font-cjk-serif text-sm text-ink-muted">
                — 一个人就是一个团队 —
              </p>

              <div className="ink-rise delay-600 mt-10 flex flex-wrap items-center gap-4">
                <StartReadingCta targetPath={pathB ?? pathA} />
                <Link
                  href="#routes"
                  className="group inline-flex items-center gap-2 px-6 py-3.5 text-ink transition-colors hover:text-marker"
                >
                  <span className="font-display text-lg font-semibold tracking-tight font-cjk-serif">
                    先看路线
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
          SECTION 2 · 你现在是哪种人？
         ============================================ */}
      <section id="about" className="border-b border-ink bg-paper-deep/40">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          <div className="mb-10 max-w-2xl">
            <div className="field-stamp inline-flex text-ink-soft">
              <span className="font-cjk-serif">第二部分</span>
            </div>
            <h2 className="mt-5 font-display text-4xl font-bold leading-tight tracking-display text-ink lg:text-5xl">
              <span className="font-cjk-serif">你现在</span>
              <span className="font-cjk-serif">
                <span className="marker-line">卡在哪儿</span>
              </span>
              <span className="font-cjk-serif">？</span>
            </h2>
            <p className="mt-4 font-cjk-serif text-base leading-relaxed text-ink-soft">
              先认清你目前所处的位置，再决定从哪条路线开始，会比盲目看文章高效得多。
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {FIT_ITEMS.map((item, idx) => (
              <div
                key={item}
                className="field-card-inset group flex items-start gap-4 p-5 transition-colors hover:bg-paper-deep"
              >
                <span className="num-circle bg-paper text-ink transition-colors group-hover:bg-marker group-hover:text-paper group-hover:border-marker">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 pt-1">
                  <p className="font-cjk-serif text-base font-medium leading-snug text-ink">
                    {item}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 3 · 你会放弃的四个地方
         ============================================ */}
      <section className="border-b border-ink">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:gap-16">
            <div className="lg:max-w-xs">
              <div className="field-stamp inline-flex text-ink-soft">
                <span className="font-cjk-serif">第三部分</span>
              </div>
              <h2 className="mt-5 font-display text-4xl font-bold leading-tight tracking-display text-ink lg:text-5xl">
                <span className="font-cjk-serif">AI 会写代码。</span>
                <br />
                <span className="font-cjk-serif">
                  但<span className="marker-line">你会放弃</span>在这些地方：
                </span>
              </h2>
              <p className="mt-6 font-cjk-serif text-sm text-ink-muted">
                这是大多数新手会卡住的 4 个点。
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
        </div>
      </section>

      {/* ============================================
          SECTION 4 · 推荐学习路线（最重要）
         ============================================ */}
      <section id="routes" className="border-b border-ink bg-paper-deep/40">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          <div className="mb-10 max-w-3xl">
            <div className="field-stamp inline-flex text-ink-soft">
              <span className="font-cjk-serif">第四部分</span>
            </div>
            <h2 className="mt-5 font-display text-4xl font-bold tracking-display text-ink lg:text-5xl">
              <span className="font-cjk-serif">先走路线，</span>
              <span className="font-cjk-serif">再看专题。</span>
            </h2>
            <p className="mt-4 font-cjk-serif text-base leading-relaxed text-ink-soft">
              如果你还不知道自己该从哪里开始，就不要先看零散文章。先按下面的推荐路线走，效率最高。
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <article className="field-card tape-strip p-8 ink-shadow">
              <div className="flex items-center justify-between gap-4">
                <span className="field-stamp field-stamp-solid">
                  <span className="font-cjk-serif">路径 A</span>
                </span>
                <span className="font-cjk-serif text-sm text-ink-muted">
                  基础认知 · 免费
                </span>
              </div>
              <h3 className="mt-6 font-display text-3xl font-bold tracking-tight text-ink">
                <span className="font-cjk-serif">先把世界观搞对</span>
              </h3>
              <p className="mt-4 font-cjk-serif text-base leading-relaxed text-ink-soft">
                适合：还没建立 AI 开发认知的人。先搞懂工具、边界、心智模型，避免一开始就被概念劝退。
              </p>
              <ul className="mt-5 space-y-2 font-cjk-serif text-sm text-ink-soft">
                <li>• 理解 AI 编程到底擅长什么、不擅长什么</li>
                <li>• 知道为什么你和 AI 会陷入提问循环</li>
                <li>• 先建立判断力，再动手做产品</li>
              </ul>
              <div className="mt-8 flex items-center justify-between border-t border-ink/15 pt-4">
                <span className="font-cjk-serif text-sm text-ink-muted">6 讲 · 免费</span>
                <Link
                  href={pathA ? `/paths/${pathA}` : "#"}
                  className="font-display text-lg font-medium text-ink hover:text-marker"
                >
                  开始学习 →
                </Link>
              </div>
            </article>

            <article className="field-card tape-strip tape-strip-yellow p-8 ink-shadow-static border-2 border-marker">
              <div className="flex items-center justify-between gap-4">
                <span className="field-stamp field-stamp-solid">
                  <span className="font-cjk-serif">路径 B · 推荐新手</span>
                </span>
                <span className="font-cjk-serif text-sm font-medium text-marker">
                  从 0 到上线一个网站
                </span>
              </div>
              <h3 className="mt-6 font-display text-3xl font-bold tracking-tight text-ink">
                <span className="font-cjk-serif">完全小白，也能一步一步把网站发布出去</span>
              </h3>
              <p className="mt-4 font-cjk-serif text-base leading-relaxed text-ink-soft">
                适合：你脑子里已经有网站或产品的想法，但根本不知道先从哪里开始。GitHub、Vercel、Neon、Cloudflare、邮箱验证码……这一条路线会把顺序讲透。
              </p>
              <ul className="mt-5 space-y-2 font-cjk-serif text-sm text-ink-soft">
                <li>• 先理解每个平台分别负责什么</li>
                <li>• 再按顺序注册和打通整条链路</li>
                <li>• 目标不是学会全部技术，而是把网站真的跑起来</li>
              </ul>
              <div className="mt-8 flex items-center justify-between border-t border-ink/15 pt-4">
                <span className="font-cjk-serif text-sm font-medium text-ink-muted">8 讲 · 免费</span>
                <Link
                  href={pathB ? `/paths/${pathB}` : "#"}
                  className="font-display text-lg font-semibold text-marker hover:text-ink"
                >
                  从第 1 篇开始 →
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 5 · 独立专题
         ============================================ */}
      <section id="latest" className="border-b border-ink">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="field-stamp inline-flex text-ink-soft">
                <span className="font-cjk-serif">第五部分</span>
              </div>
              <h2 className="mt-5 font-display text-4xl font-bold tracking-display text-ink lg:text-5xl">
                <span className="font-cjk-serif">已经知道自己卡在哪？</span>
                <br />
                <span className="font-cjk-serif">就直接看专题。</span>
              </h2>
              <p className="mt-4 font-cjk-serif text-base leading-relaxed text-ink-soft">
                专题适合已经知道自己问题的人，比如：我只卡在微信登录、支付接入、DNS、发邮件这些具体点。
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
                真正独立的专题还在整理中，先优先走上面的学习路线。
              </p>
            </div>
          ) : (
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
                        <p className="mt-1 font-cjk-serif text-sm leading-relaxed text-ink-soft">
                          {topic.summary}
                        </p>
                      )}
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
          )}
        </div>
      </section>

      {/* ============================================
          SECTION 6 · 为什么和别的知识站不一样
         ============================================ */}
      <section className="border-b border-ink bg-paper-deep/40">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          <div className="mb-10 max-w-2xl">
            <div className="field-stamp inline-flex text-ink-soft">
              <span className="font-cjk-serif">第六部分</span>
            </div>
            <h2 className="mt-5 font-display text-4xl font-bold tracking-display text-ink lg:text-5xl">
              <span className="font-cjk-serif">为什么这里和普通知识站不一样？</span>
            </h2>
            <p className="mt-4 font-cjk-serif text-base leading-relaxed text-ink-soft">
              大多数知识站帮助你积累知识，但很难帮你把一件事真正做成。这里的目标不是让你学更多，而是让你跑通一个真实结果。
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {DIFFERENCE_POINTS.map((item, idx) => (
              <div key={item} className="field-card p-5 ink-shadow">
                <div className="font-display text-4xl font-black text-marker">
                  0{idx + 1}
                </div>
                <p className="mt-4 font-cjk-serif text-base leading-relaxed text-ink-soft">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
