import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { listProgress } from "@/lib/server-progress";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({}, { status: 200 });
  }
  const progress = await listProgress(user.id);
  return NextResponse.json(progress);
}
