import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { password } = (await req.json().catch(() => ({}))) as {
    password?: string;
  };
  if (!password || password !== process.env.APP_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const session = await getSession();
  session.authenticated = true;
  await session.save();
  return NextResponse.json({ ok: true });
}
