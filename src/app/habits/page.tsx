"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Habit } from "@/lib/types";

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/habits")
      .then((r) => r.json())
      .then((h) => {
        setHabits(h as Habit[]);
        setLoading(false);
      });
  }, []);

  async function del(id: string) {
    if (!confirm("Delete this habit and all its history?")) return;
    await fetch(`/api/habits/${id}`, { method: "DELETE" });
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-24">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-zinc-500">
            ‹ Today
          </Link>
          <h1 className="text-2xl font-semibold">Habits</h1>
        </div>
        <button
          onClick={logout}
          className="text-xs text-zinc-400 hover:text-rose-500"
        >
          Sign out
        </button>
      </header>

      <Link
        href="/habits/new"
        className="block mb-4 py-3 rounded-xl bg-indigo-600 text-white font-medium text-center"
      >
        + New habit
      </Link>

      {loading ? (
        <div className="text-center text-zinc-500 py-8">Loading…</div>
      ) : habits.length === 0 ? (
        <div className="text-center text-zinc-500 py-8">No habits yet.</div>
      ) : (
        <div className="space-y-2">
          {habits.map((h) => (
            <div
              key={h.id}
              className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-zinc-900 border-l-4"
              style={{ borderLeftColor: h.color }}
            >
              <div className="text-2xl">{h.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{h.name}</div>
                <div className="text-xs text-zinc-500 truncate">
                  {h.input_type}
                  {h.unit ? ` · ${h.unit}` : ""}
                  {h.target !== null ? ` · target ${h.target}` : ""}
                </div>
              </div>
              <Link
                href={`/habits/${h.id}/edit`}
                className="text-sm px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800"
              >
                Edit
              </Link>
              <button
                onClick={() => del(h.id)}
                className="text-sm px-3 py-1 rounded-lg text-rose-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
