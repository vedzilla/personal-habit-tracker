import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ctype = req.headers.get("content-type") ?? "";
  const isForm =
    ctype.includes("application/x-www-form-urlencoded") ||
    ctype.includes("multipart/form-data");

  let password: string | undefined;
  if (isForm) {
    const form = await req.formData().catch(() => null);
    password = form?.get("password")?.toString();
  } else {
    const body = (await req.json().catch(() => ({}))) as { password?: string };
    password = body.password;
  }

  if (!password || password !== process.env.APP_PASSWORD) {
    if (isForm) {
      return NextResponse.redirect(new URL("/login?error=1", req.url), 303);
    }
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const session = await getSession();
  session.authenticated = true;
  await session.save();

  if (isForm) {
    return NextResponse.redirect(new URL("/", req.url), 303);
  }
  return NextResponse.json({ ok: true });
}
