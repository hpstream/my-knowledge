import Link from "next/link";
import { getFreePaths } from "@/lib/content";
import { listPublishedTopics } from "@/lib/articles";
import { HomeSearch } from "@/components/home/HomeSearch";
import { SeriesGridCard } from "@/components/home/SeriesGridCard";
import { TopicGridCard } from "@/components/home/TopicGridCard";
import { PaidCoursesSection } from "@/components/home/PaidCoursesSection";
import { SubscribeBanner } from "@/components/home/SubscribeBanner";
import { SiteFooter } from "@/components/SiteFooter";

export default async function Home() {
  const [freePaths, topics] = await Promise.all([
    getFreePaths(),
    listPublishedTopics(),
  ]);

  const featuredPaths = freePaths.slice(0, 4);
  const visibleTopics = topics.slice(0, 4);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-white text-slate-900">
      <div className="flex-1">
      <section className="relative overflow-hidden border-b border-slate-100">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-50 [background-image:radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]"
        />
        <div className="mx-auto max-w-4xl px-6 pt-14 pb-12 text-center lg:pt-20 lg:pb-16">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            <span className="text-orange-500">一个人</span>
            <span>，也能造一家公司</span>
          </h1>
          <p className="mt-6 text-lg text-slate-500">
            分享最实用的 AI 攻略、工具、模板，帮你一个人也能交付
          </p>
          <HomeSearch />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
            免费精选系列
          </h2>
          <Link
            href="/search?kind=path"
            className="text-sm font-medium text-orange-500 transition hover:text-orange-600"
          >
            查看全部 →
          </Link>
        </div>

        {featuredPaths.length === 0 ? (
          <p className="text-sm text-slate-500">还没有上线的系列，敬请期待。</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredPaths.map((path, i) => (
              <SeriesGridCard key={path.slug} path={path} index={i} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-10 lg:px-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
            全部专题
          </h2>
          <Link
            href="/search?kind=topic"
            className="text-sm font-medium text-orange-500 transition hover:text-orange-600"
          >
            查看全部 →
          </Link>
        </div>

        {visibleTopics.length === 0 ? (
          <p className="text-sm text-slate-500">还没有发布的专题，敬请期待。</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visibleTopics.map((topic, i) => (
              <TopicGridCard key={topic.slug} topic={topic} index={i} />
            ))}
          </div>
        )}
      </section>

      <PaidCoursesSection />

      <section className="mx-auto max-w-7xl px-6 pb-12 lg:px-10">
        <SubscribeBanner />
      </section>
      </div>

      <SiteFooter />
    </div>
  );
}
