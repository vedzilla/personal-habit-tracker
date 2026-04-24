import Link from "next/link";
import { notFound } from "next/navigation";
import HabitForm from "@/components/HabitForm";
import { supabase } from "@/lib/supabase";
import type { Habit } from "@/lib/types";

export default async function EditHabitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) notFound();

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-24">
      <header className="flex items-center gap-3 mb-6">
        <Link href="/habits" className="text-zinc-500">
          ‹ Back
        </Link>
        <h1 className="text-2xl font-semibold">Edit habit</h1>
      </header>
      <HabitForm habit={data as Habit} />
    </div>
  );
}
