import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("archived", false)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { data, error } = await supabase
    .from("habits")
    .insert({
      name: body.name,
      emoji: body.emoji || "✨",
      color: body.color || "#6366f1",
      input_type: body.input_type || "checkbox",
      unit: body.unit || null,
      min_value: body.min_value ?? 0,
      max_value: body.max_value ?? 10,
      step: body.step ?? 1,
      target: body.target ?? null,
      direction: body.direction === "negative" ? "negative" : "positive",
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
