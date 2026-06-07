import { searchAll, type SearchKind } from "@/lib/search";
import { SearchBar } from "@/components/search/SearchBar";
import { FilterChips } from "@/components/search/FilterChips";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { SiteFooter } from "@/components/SiteFooter";

export const dynamic = "force-dynamic";

const VALID_KINDS: SearchKind[] = ["all", "topic", "path"];

function normalizeKind(raw: string | undefined): SearchKind {
  if (!raw) return "all";
  return (VALID_KINDS as string[]).includes(raw) ? (raw as SearchKind) : "all";
}

type SearchParams = {
  q?: string;
  kind?: string;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").slice(0, 100);
  const kind = normalizeKind(params.kind);

  const results = await searchAll({ q, kind });

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-white text-slate-900">
      <div className="flex-1">
        <section className="mx-auto max-w-7xl px-6 pt-10 pb-6 lg:px-10">
          <h1 className="text-3xl font-bold tracking-tight">浏览全部</h1>
          <p className="mt-2 text-sm text-slate-500">
            文章 + 系列 + 工具，一站式搜索
          </p>
          <div className="mt-6">
            <SearchBar initialQuery={q} />
          </div>
          {q && (
            <p className="mt-3 text-sm text-slate-500">
              找到 <span className="font-semibold text-slate-900">{results.length}</span> 条结果
            </p>
          )}
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-4 lg:px-10">
          <FilterChips currentKind={kind} currentQuery={q} />
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-12 lg:px-10">
          {results.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
              {q ? `没有找到 "${q}" 相关的内容` : "暂无内容"}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((r, i) => (
                <SearchResultCard
                  key={`${r.kind}-${r.slug}`}
                  result={r}
                  index={i}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
