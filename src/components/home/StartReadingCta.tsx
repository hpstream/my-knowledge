"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

type Props = {
  /** Path slug to navigate to after auth (or directly if already authed) */
  targetPath: string | null;
};

export function StartReadingCta({ targetPath }: Props) {
  const router = useRouter();
  const { user, openLoginModal } = useAuth();

  async function handleClick() {
    if (!targetPath) return;
    const dest = `/paths/${targetPath}`;
    if (user) {
      router.push(dest);
      return;
    }
    const result = await openLoginModal({ returnTo: dest });
    if (result.ok) router.push(dest);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!targetPath}
      className="group relative inline-flex items-center gap-2 bg-ink px-6 py-3.5 text-paper transition-all hover:bg-marker disabled:cursor-not-allowed disabled:opacity-40 rounded-sm"
    >
      <span className="font-cjk-serif text-lg font-semibold tracking-tight">
        开始阅读
      </span>
      <span className="transition-transform group-hover:translate-x-1 text-lg">
        →
      </span>
    </button>
  );
}
