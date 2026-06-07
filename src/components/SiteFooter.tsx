import Link from "next/link";

const FOOTER_LINKS: Array<{
  title: string;
  items: Array<{ href: string; label: string }>;
}> = [
  {
    title: "产品",
    items: [
      { href: "/search?kind=topic", label: "全部专题" },
      { href: "/search?kind=path", label: "免费课程" },
      { href: "/about", label: "会员权益" },
      { href: "/about", label: "更新日志" },
    ],
  },
  {
    title: "内容",
    items: [
      { href: "/search", label: "文章攻略" },
      { href: "/search", label: "案例拆解" },
      { href: "/search", label: "资源下载" },
      { href: "/search", label: "热门推荐" },
    ],
  },
  {
    title: "关于",
    items: [
      { href: "/about", label: "关于我们" },
      { href: "/about", label: "加入我们" },
      { href: "/about", label: "联系我们" },
      { href: "/privacy", label: "服务条款" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full p-[2px] ring-1 ring-slate-900">
                <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-slate-900 text-[13px] font-bold leading-none text-white">
                  超
                </span>
              </span>
              <span className="text-[15px] font-bold tracking-tight text-slate-900">
                超级个体
              </span>
            </Link>
            <p className="mt-3 text-sm text-slate-500">
              帮助个体更好的学习、创造、变现
            </p>
          </div>
          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold text-slate-900">{col.title}</h4>
              <ul className="mt-3 space-y-2.5 text-sm text-slate-500">
                {col.items.map((item) => (
                  <li key={col.title + item.label}>
                    <Link
                      href={item.href}
                      className="transition hover:text-slate-900"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
