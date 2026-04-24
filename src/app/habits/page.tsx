"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import type { Habit } from "@/lib/types";

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

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

  async function duplicate(h: Habit) {
    const res = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${h.name} (copy)`,
        emoji: h.emoji,
        color: h.color,
        input_type: h.input_type,
        unit: h.unit,
        min_value: h.min_value,
        max_value: h.max_value,
        step: h.step,
        target: h.target,
      }),
    });
    if (res.ok) {
      const copy = (await res.json()) as Habit;
      setHabits((prev) => [...prev, copy]);
    }
  }

  return (
    <main className="min-h-screen grain">
      <div className="relative z-10 max-w-xl mx-auto px-6 pt-10 pb-32">
        <TopNav />

        <header className="mb-10 flex items-end justify-between">
          <div>
            <p className="kicker">Your index</p>
            <h1 className="serif italic text-5xl mt-3 leading-none">Habits.</h1>
          </div>
          <Link
            href="/habits/new"
            className="text-[11px] tracking-[0.22em] uppercase border hairline px-4 py-2 hover:bg-ink hover:text-paper transition-colors"
          >
            + New
          </Link>
        </header>

        {loading ? (
          <div className="text-soft text-sm">Loading…</div>
        ) : habits.length === 0 ? (
          <div className="border-t border-b hairline py-16 text-center">
            <p className="serif italic text-2xl">Nothing to manage yet.</p>
          </div>
        ) : (
          <ul className="border-t hairline stagger">
            {habits.map((h) => (
              <li
                key={h.id}
                className="border-b hairline py-5 flex items-center gap-4"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: h.color }}
                  aria-hidden
                />
                <span className="text-xl">{h.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="serif italic text-xl truncate">{h.name}</div>
                  <div className="kicker mt-1">
                    {h.input_type}
                    {h.unit ? ` · ${h.unit}` : ""}
                    {h.target !== null && h.target !== undefined
                      ? ` · target ${h.target}`
                      : ""}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] tracking-[0.22em] uppercase">
                  <Link
                    href={`/habits/${h.id}/edit`}
                    className="text-muted hover:text-ink transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => duplicate(h)}
                    className="text-muted hover:text-ink transition-colors"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => del(h.id)}
                    className="text-muted hover:text-[color:var(--ink)] transition-colors"
                  >
                    Del
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
