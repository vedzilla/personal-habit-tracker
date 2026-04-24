"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Habit, Entry } from "@/lib/types";

function dateDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const DAYS = 60;

export default function StatsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const from = dateDaysAgo(DAYS - 1);
      const to = dateDaysAgo(0);
      const [h, e] = await Promise.all([
        fetch("/api/habits").then((r) => r.json()),
        fetch(`/api/entries?from=${from}&to=${to}`).then((r) => r.json()),
      ]);
      setHabits(h as Habit[]);
      setEntries(e as Entry[]);
      setLoading(false);
    })();
  }, []);

  const days = useMemo(() => {
    const arr: string[] = [];
    for (let i = DAYS - 1; i >= 0; i--) arr.push(dateDaysAgo(i));
    return arr;
  }, []);

  const entriesByHabit = useMemo(() => {
    const map: Record<string, Record<string, Entry>> = {};
    for (const e of entries) {
      if (!map[e.habit_id]) map[e.habit_id] = {};
      map[e.habit_id][e.logged_date] = e;
    }
    return map;
  }, [entries]);

  function streak(habitId: string) {
    const m = entriesByHabit[habitId] ?? {};
    let s = 0;
    for (let i = 0; i < 365; i++) {
      const d = dateDaysAgo(i);
      const e = m[d];
      const hit = e && Number(e.value) > 0;
      if (hit) s++;
      else if (i === 0) continue;
      else break;
    }
    return s;
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-24">
      <header className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-zinc-500">
          ‹ Today
        </Link>
        <h1 className="text-2xl font-semibold">Stats</h1>
      </header>

      {loading ? (
        <div className="text-center text-zinc-500 py-8">Loading…</div>
      ) : habits.length === 0 ? (
        <div className="text-center text-zinc-500 py-8">No habits yet.</div>
      ) : (
        <div className="space-y-6">
          {habits.map((h) => {
            const m = entriesByHabit[h.id] ?? {};
            const s = streak(h.id);
            const logged = Object.values(m).filter(
              (e) => Number(e.value) > 0,
            ).length;
            const denom = Number(h.target) || Number(h.max_value) || 1;
            return (
              <div
                key={h.id}
                className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border-l-4"
                style={{ borderLeftColor: h.color }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{h.emoji}</div>
                    <div className="font-medium">{h.name}</div>
                  </div>
                  <div className="text-xs text-zinc-500">
                    🔥 {s}d · {logged}/{DAYS}
                  </div>
                </div>
                <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1">
                  {days.map((d) => {
                    const e = m[d];
                    const v = e ? Number(e.value) : 0;
                    const filled = v > 0;
                    const opacity = filled
                      ? h.input_type === "checkbox"
                        ? 1
                        : Math.min(1, 0.3 + (v / denom) * 0.7)
                      : 1;
                    return (
                      <div
                        key={d}
                        title={`${d}: ${e ? e.value : "—"}`}
                        className="aspect-square rounded-sm"
                        style={{
                          backgroundColor: filled
                            ? h.color
                            : "rgba(127,127,127,0.12)",
                          opacity,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
