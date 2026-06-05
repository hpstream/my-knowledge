import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUser, type SessionUser } from "./session";

export async function requireAdminUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/?auth=required&return_to=/admin/articles");
  }
  if (user.role !== "admin") {
    redirect("/");
  }
  return user;
}

export async function ensureAdmin(): Promise<SessionUser | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}
