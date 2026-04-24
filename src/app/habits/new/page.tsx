import Link from "next/link";
import HabitForm from "@/components/HabitForm";

export default function NewHabitPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-24">
      <header className="flex items-center gap-3 mb-6">
        <Link href="/habits" className="text-zinc-500">
          ‹ Back
        </Link>
        <h1 className="text-2xl font-semibold">New habit</h1>
      </header>
      <HabitForm />
    </div>
  );
}
