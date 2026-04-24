"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import { api, Unauthorized } from "@/lib/api";
import type { Habit } from "@/lib/types";

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const h = await api<Habit[]>("/api/habits");
        if (cancelled) return;
        setHabits(Array.isArray(h) ? h : []);
      } catch (err) {
        if (cancelled || err instanceof Unauthorized) return;
        setError(err instanceof Error ? err.message : "Couldn't load habits.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  async function del(id: string) {
    if (!confirm("Delete this habit and all its history?")) return;
    try {
      await api(`/api/habits/${id}`, { method: "DELETE" });
      setHabits((prev) => prev.filter((h) => h.id !== id));
    } catch {}
  }

  async function duplicate(h: Habit) {
    try {
      const copy = await api<Habit>("/api/habits", {
        method: "POST",
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
          direction: h.direction,
        }),
      });
      setHabits((prev) => [...prev, copy]);
    } catch {}
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

        {error ? (
          <div className="border-t border-b hairline py-12 text-center">
            <p className="kicker mb-3">Couldn&apos;t load</p>
            <p className="serif italic text-xl mb-5">{error}</p>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="inline-block border hairline px-5 py-2.5 text-[11px] tracking-[0.22em] uppercase hover:bg-ink hover:text-paper transition-colors"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="text-soft text-sm text-center py-8">Loading…</div>
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
                      ? ` · ${h.direction === "negative" ? "under" : "target"} ${h.target}`
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
