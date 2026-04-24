"use client";
import { useEffect, useMemo, useState } from "react";
import TopNav from "@/components/TopNav";
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
    <main className="min-h-screen grain">
      <div className="relative z-10 max-w-xl mx-auto px-6 pt-10 pb-32">
        <TopNav />

        <header className="mb-12">
          <p className="kicker">The record</p>
          <h1 className="serif italic text-5xl mt-3 leading-none">
            Sixty days.
          </h1>
        </header>

        {loading ? (
          <div className="text-soft text-sm">Loading…</div>
        ) : habits.length === 0 ? (
          <div className="border-t border-b hairline py-16 text-center">
            <p className="serif italic text-2xl">Nothing to show yet.</p>
          </div>
        ) : (
          <div className="space-y-10 stagger">
            {habits.map((h) => {
              const m = entriesByHabit[h.id] ?? {};
              const s = streak(h.id);
              const logged = Object.values(m).filter(
                (e) => Number(e.value) > 0,
              ).length;
              const denom = Number(h.target) || Number(h.max_value) || 1;
              return (
                <section key={h.id} className="border-t hairline pt-6">
                  <header className="flex items-baseline justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: h.color }}
                      />
                      <span className="text-xl">{h.emoji}</span>
                      <h2 className="serif italic text-2xl">{h.name}</h2>
                    </div>
                    <div className="text-right">
                      <div className="serif tabular text-3xl leading-none">
                        {s}
                      </div>
                      <div className="kicker mt-1">day streak</div>
                    </div>
                  </header>
                  <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-[3px]">
                    {days.map((d) => {
                      const e = m[d];
                      const v = e ? Number(e.value) : 0;
                      const filled = v > 0;
                      const opacity = filled
                        ? h.input_type === "checkbox"
                          ? 1
                          : Math.min(1, 0.35 + (v / denom) * 0.65)
                        : 1;
                      return (
                        <div
                          key={d}
                          title={`${d}: ${e ? e.value : "—"}`}
                          className="aspect-square"
                          style={{
                            backgroundColor: filled
                              ? h.color
                              : "var(--line)",
                            opacity,
                          }}
                        />
                      );
                    })}
                  </div>
                  <div className="kicker mt-3 text-right">
                    {logged} / {DAYS} days
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
