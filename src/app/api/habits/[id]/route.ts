import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();
  const update: Record<string, unknown> = {};
  const fields = [
    "name",
    "emoji",
    "color",
    "input_type",
    "unit",
    "min_value",
    "max_value",
    "step",
    "target",
    "direction",
    "position",
    "archived",
  ];
  for (const f of fields) {
    if (f in body) update[f] = body[f];
  }
  const { data, error } = await supabase
    .from("habits")
    .update(update)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const { error } = await supabase.from("habits").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
