import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const habitId = url.searchParams.get("habit_id");

  let q = supabase.from("entries").select("*");
  if (from) q = q.gte("logged_date", from);
  if (to) q = q.lte("logged_date", to);
  if (habitId) q = q.eq("habit_id", habitId);
  q = q.order("logged_date", { ascending: false });

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { habit_id, value, logged_date } = body as {
    habit_id?: string;
    value?: number;
    logged_date?: string;
  };
  if (!habit_id || value === undefined) {
    return NextResponse.json({ error: "habit_id and value required" }, { status: 400 });
  }
  const date = logged_date ?? new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("entries")
    .upsert(
      { habit_id, value, logged_date: date },
      { onConflict: "habit_id,logged_date" },
    )
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const habit_id = url.searchParams.get("habit_id");
  const logged_date = url.searchParams.get("logged_date");
  if (!habit_id || !logged_date) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }
  const { error } = await supabase
    .from("entries")
    .delete()
    .eq("habit_id", habit_id)
    .eq("logged_date", logged_date);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
