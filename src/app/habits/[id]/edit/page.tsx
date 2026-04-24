import Link from "next/link";
import { notFound } from "next/navigation";
import HabitForm from "@/components/HabitForm";
import TopNav from "@/components/TopNav";
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
    <main className="min-h-screen grain">
      <div className="relative z-10 max-w-xl mx-auto px-6 pt-10 pb-32">
        <TopNav />
        <header className="mb-10">
          <Link
            href="/habits"
            className="kicker hover:text-ink transition-colors"
          >
            ← Back
          </Link>
          <h1 className="serif italic text-5xl mt-3 leading-none">
            Refine.
          </h1>
        </header>
        <HabitForm habit={data as Habit} />
      </div>
    </main>
  );
}
