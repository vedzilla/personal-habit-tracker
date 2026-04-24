"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Habit, Entry } from "@/lib/types";

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [loading, setLoading] = useState(true);
  const today = todayStr();

  useEffect(() => {
    async function load() {
      const [h, e] = await Promise.all([
        fetch("/api/habits").then((r) => r.json()),
        fetch(`/api/entries?from=${today}&to=${today}`).then((r) => r.json()),
      ]);
      setHabits(h as Habit[]);
      const map: Record<string, Entry> = {};
      for (const x of e as Entry[]) map[x.habit_id] = x;
      setEntries(map);
      setLoading(false);
    }
    load();
  }, [today]);

  async function log(habit: Habit, value: number) {
    setEntries((prev) => ({
      ...prev,
      [habit.id]: {
        id: prev[habit.id]?.id ?? "",
        habit_id: habit.id,
        value,
        logged_date: today,
        created_at: prev[habit.id]?.created_at ?? new Date().toISOString(),
      },
    }));
    await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habit_id: habit.id, value, logged_date: today }),
    });
  }

  async function clearLog(habit: Habit) {
    setEntries((prev) => {
      const n = { ...prev };
      delete n[habit.id];
      return n;
    });
    await fetch(`/api/entries?habit_id=${habit.id}&logged_date=${today}`, {
      method: "DELETE",
    });
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-24">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Today</h1>
          <p className="text-sm text-zinc-500">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/habits"
            className="px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm"
          >
            Manage
          </Link>
          <Link
            href="/stats"
            className="px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm"
          >
            Stats
          </Link>
        </div>
      </header>

      {loading ? (
        <div className="text-center text-zinc-500 py-16">Loading…</div>
      ) : habits.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🌱</div>
          <p className="text-zinc-500 mb-4">No habits yet.</p>
          <Link
            href="/habits/new"
            className="inline-block px-5 py-3 rounded-xl bg-indigo-600 text-white font-medium"
          >
            Add your first habit
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((h) => (
            <HabitCard
              key={h.id}
              habit={h}
              entry={entries[h.id]}
              onLog={(v) => log(h, v)}
              onClear={() => clearLog(h)}
            />
          ))}
        </div>
      )}

      <Link
        href="/habits/new"
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-indigo-600 text-white shadow-lg flex items-center justify-center text-3xl font-light"
        aria-label="Add habit"
      >
        +
      </Link>
    </div>
  );
}

function HabitCard({
  habit,
  entry,
  onLog,
  onClear,
}: {
  habit: Habit;
  entry?: Entry;
  onLog: (v: number) => void;
  onClear: () => void;
}) {
  const done = entry !== undefined;
  return (
    <div
      className="rounded-2xl p-4 bg-white dark:bg-zinc-900 border-l-4 shadow-sm"
      style={{ borderLeftColor: habit.color }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{habit.emoji}</div>
          <div>
            <div className="font-medium">{habit.name}</div>
            {habit.target !== null && habit.input_type !== "checkbox" && (
              <div className="text-xs text-zinc-500">
                Target: {habit.target}
                {habit.unit ? ` ${habit.unit}` : ""}
              </div>
            )}
          </div>
        </div>
        {done && (
          <button
            onClick={onClear}
            className="text-xs text-zinc-400 hover:text-rose-500 px-2 py-1"
          >
            Clear
          </button>
        )}
      </div>
      <HabitInput
        key={entry?.id ?? "empty"}
        habit={habit}
        entry={entry}
        onLog={onLog}
      />
    </div>
  );
}

function HabitInput({
  habit,
  entry,
  onLog,
}: {
  habit: Habit;
  entry?: Entry;
  onLog: (v: number) => void;
}) {
  const [val, setVal] = useState<number>(
    entry ? Number(entry.value) : Number(habit.min_value) || 0,
  );

  if (habit.input_type === "checkbox") {
    const done = entry !== undefined && Number(entry.value) > 0;
    return (
      <button
        onClick={() => onLog(done ? 0 : 1)}
        className={`w-full py-4 rounded-xl font-medium transition ${
          done
            ? "bg-emerald-500 text-white"
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
        }`}
      >
        {done ? "✓ Done" : "Mark complete"}
      </button>
    );
  }

  if (habit.input_type === "counter") {
    const step = Number(habit.step) || 1;
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            const v = Math.max(0, val - step);
            setVal(v);
            onLog(v);
          }}
          className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-2xl font-semibold"
        >
          −
        </button>
        <div className="flex-1 text-center">
          <div className="text-3xl font-semibold">{val}</div>
          {habit.unit && <div className="text-xs text-zinc-500">{habit.unit}</div>}
        </div>
        <button
          onClick={() => {
            const v = val + step;
            setVal(v);
            onLog(v);
          }}
          className="w-12 h-12 rounded-xl text-white text-2xl font-semibold"
          style={{ backgroundColor: habit.color }}
        >
          +
        </button>
      </div>
    );
  }

  if (habit.input_type === "slider") {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-3xl font-semibold">{val}</span>
          <span className="text-xs text-zinc-500">
            {habit.min_value} – {habit.max_value}
            {habit.unit ? ` ${habit.unit}` : ""}
          </span>
        </div>
        <input
          type="range"
          min={habit.min_value}
          max={habit.max_value}
          step={habit.step || 1}
          value={val}
          onChange={(e) => setVal(Number(e.target.value))}
          onPointerUp={() => onLog(val)}
          onTouchEnd={() => onLog(val)}
          onMouseUp={() => onLog(val)}
          onKeyUp={() => onLog(val)}
          className="w-full"
          style={{ accentColor: habit.color }}
        />
      </div>
    );
  }

  // number
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        inputMode="decimal"
        value={val}
        onChange={(e) => setVal(Number(e.target.value))}
        onBlur={() => onLog(val)}
        step={habit.step || 1}
        className="flex-1 px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xl font-semibold"
      />
      {habit.unit && <span className="text-sm text-zinc-500">{habit.unit}</span>}
      <button
        onClick={() => onLog(val)}
        className="px-4 py-3 rounded-xl text-white font-medium"
        style={{ backgroundColor: habit.color }}
      >
        Save
      </button>
    </div>
  );
}
