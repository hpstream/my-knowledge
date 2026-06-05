"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { LoginModal } from "./LoginModal";

export type CurrentUser = {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: string;
};

type RequireLoginResult = { ok: boolean; user: CurrentUser | null };

type AuthContextValue = {
  user: CurrentUser | null;
  isLoading: boolean;
  openLoginModal: (options?: { returnTo?: string }) => Promise<RequireLoginResult>;
  requireLogin: (options?: { returnTo?: string }) => Promise<RequireLoginResult>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

type Props = {
  initialUser: CurrentUser | null;
  children: ReactNode;
};

export function AuthProvider({ initialUser, children }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [returnTo, setReturnTo] = useState<string | null>(null);

  const pendingResolverRef = useRef<((res: RequireLoginResult) => void) | null>(
    null,
  );

  const resolvePending = useCallback(
    (result: RequireLoginResult) => {
      const fn = pendingResolverRef.current;
      pendingResolverRef.current = null;
      if (fn) fn(result);
    },
    [],
  );

  const openLoginModal = useCallback(
    (opts?: { returnTo?: string }): Promise<RequireLoginResult> => {
      if (user) {
        return Promise.resolve({ ok: true, user });
      }
      setReturnTo(opts?.returnTo ?? null);
      setModalOpen(true);
      return new Promise<RequireLoginResult>((resolve) => {
        if (pendingResolverRef.current) {
          pendingResolverRef.current({ ok: false, user: null });
        }
        pendingResolverRef.current = resolve;
      });
    },
    [user],
  );

  const requireLogin = openLoginModal;

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const json = (await res.json()) as { user: CurrentUser | null };
      setUser(json.user);
    } catch {
      // ignore
    }
  }, []);

  const handleLoginSuccess = useCallback(
    (loggedInUser: CurrentUser) => {
      setUser(loggedInUser);
      setModalOpen(false);
      resolvePending({ ok: true, user: loggedInUser });
      if (returnTo) {
        router.push(returnTo);
        router.refresh();
      } else {
        router.refresh();
      }
      setReturnTo(null);
    },
    [returnTo, router, resolvePending],
  );

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    resolvePending({ ok: false, user: null });
    setReturnTo(null);
  }, [resolvePending]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("auth") === "required") {
      const rt = url.searchParams.get("return_to");
      url.searchParams.delete("auth");
      url.searchParams.delete("return_to");
      window.history.replaceState({}, "", url.toString());
      if (!user) {
        setReturnTo(rt);
        setModalOpen(true);
      }
    }
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      openLoginModal,
      requireLogin,
      logout,
      refresh,
    }),
    [user, isLoading, openLoginModal, requireLogin, logout, refresh],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {modalOpen && (
        <LoginModal onClose={handleModalClose} onSuccess={handleLoginSuccess} />
      )}
    </AuthContext.Provider>
  );
}
