import Link from "next/link";
import HabitForm from "@/components/HabitForm";
import TopNav from "@/components/TopNav";

export default function NewHabitPage() {
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
            A new habit.
          </h1>
          <p className="text-muted text-sm mt-2">
            Shape it like you mean it.
          </p>
        </header>
        <HabitForm />
      </div>
    </main>
  );
}
