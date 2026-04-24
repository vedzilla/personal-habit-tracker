"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import type { Habit, Entry } from "@/lib/types";

function toDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function todayStr() {
  return toDateStr(new Date());
}
function shiftDate(s: string, days: number) {
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return toDateStr(dt);
}
function labelFor(selected: string): { kicker: string; weekday: string } {
  const today = todayStr();
  const yesterday = shiftDate(today, -1);
  const tomorrow = shiftDate(today, 1);
  const [y, m, d] = selected.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const weekday = dt.toLocaleDateString(undefined, { weekday: "long" });
  if (selected === today) return { kicker: "Today", weekday };
  if (selected === yesterday) return { kicker: "Yesterday", weekday };
  if (selected === tomorrow) return { kicker: "Tomorrow", weekday };
  return { kicker: weekday, weekday };
}
function fullDateLine(selected: string) {
  const [y, m, d] = selected.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function isFulfilled(habit: Habit, value: number | undefined): boolean {
  if (value === undefined || value <= 0) return false;
  if (habit.input_type === "checkbox") return value > 0;
  if (habit.target !== null && habit.target !== undefined) {
    return Number(value) >= Number(habit.target);
  }
  return false;
}

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>(todayStr());
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [h, e] = await Promise.all([
        fetch("/api/habits").then((r) => r.json()),
        fetch(`/api/entries?from=${selected}&to=${selected}`).then((r) =>
          r.json(),
        ),
      ]);
      if (cancelled) return;
      setHabits(h as Habit[]);
      const map: Record<string, Entry> = {};
      for (const x of e as Entry[]) map[x.habit_id] = x;
      setEntries(map);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [selected]);

  async function log(habit: Habit, value: number) {
    const wasHit = isFulfilled(habit, entries[habit.id]?.value);
    const nowHit = isFulfilled(habit, value);
    if (nowHit && !wasHit) {
      setToast("let your systems win");
      setTimeout(() => setToast(null), 2400);
    }
    setEntries((prev) => ({
      ...prev,
      [habit.id]: {
        id: prev[habit.id]?.id ?? "",
        habit_id: habit.id,
        value,
        logged_date: selected,
        created_at: prev[habit.id]?.created_at ?? new Date().toISOString(),
      },
    }));
    await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        habit_id: habit.id,
        value,
        logged_date: selected,
      }),
    });
  }

  async function clearLog(habit: Habit) {
    setEntries((prev) => {
      const n = { ...prev };
      delete n[habit.id];
      return n;
    });
    await fetch(
      `/api/entries?habit_id=${habit.id}&logged_date=${selected}`,
      { method: "DELETE" },
    );
  }

  function prevDay() {
    setSelected((s) => shiftDate(s, -1));
  }
  function nextDay() {
    setSelected((s) => shiftDate(s, 1));
  }
  function goToday() {
    setSelected(todayStr());
  }

  function onTouchStart(e: React.TouchEvent) {
    const t = e.target as HTMLElement;
    if (t.closest("input, button, a, [role='slider']")) return;
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) < 60 || Math.abs(dy) > 50) return;
    if (dx > 0) prevDay();
    else nextDay();
  }

  const { kicker, weekday } = labelFor(selected);
  const isToday = selected === todayStr();

  return (
    <main
      className="min-h-screen grain touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-6"
        >
          <div
            className="serif italic text-4xl sm:text-5xl text-center leading-tight text-ink"
            style={{ animation: "toastCenter 2200ms ease-out both" }}
          >
            {toast}.
          </div>
        </div>
      )}
      <div className="relative max-w-xl mx-auto px-6 pt-10 pb-32 z-10">
        <TopNav />

        <header className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevDay}
              aria-label="Previous day"
              className="w-9 h-9 rounded-full border hairline text-muted hover:text-ink hover:bg-[color:var(--surface)] transition-colors flex items-center justify-center text-lg leading-none"
            >
              ‹
            </button>
            <button
              onClick={goToday}
              disabled={isToday}
              className="kicker disabled:opacity-60"
              title="Jump to today"
            >
              {kicker}
            </button>
            <button
              onClick={nextDay}
              aria-label="Next day"
              className="w-9 h-9 rounded-full border hairline text-muted hover:text-ink hover:bg-[color:var(--surface)] transition-colors flex items-center justify-center text-lg leading-none"
            >
              ›
            </button>
          </div>
          <h1 className="serif italic text-6xl leading-[0.95] text-center">
            {weekday}.
          </h1>
          <p className="text-muted text-sm mt-2 text-center">
            {fullDateLine(selected)}
          </p>
          {!isToday && (
            <div className="mt-4 text-center">
              <button
                onClick={goToday}
                className="text-[11px] tracking-[0.22em] uppercase text-muted hover:text-ink transition-colors border-b hairline pb-0.5"
              >
                Back to today
              </button>
            </div>
          )}
        </header>

        {loading ? (
          <div className="text-soft text-sm">Loading…</div>
        ) : habits.length === 0 ? (
          <div className="border-t border-b hairline py-16 text-center">
            <p className="kicker mb-3">Nothing yet</p>
            <p className="serif italic text-2xl mb-6">
              Name the first small thing.
            </p>
            <Link
              href="/habits/new"
              className="inline-block border hairline px-5 py-2.5 text-[11px] tracking-[0.22em] uppercase hover:bg-ink hover:text-paper transition-colors"
            >
              Add a habit
            </Link>
          </div>
        ) : (
          <div className="border-t hairline stagger">
            {habits.map((h) => (
              <HabitRow
                key={h.id}
                habit={h}
                entry={entries[h.id]}
                onLog={(v) => log(h, v)}
                onClear={() => clearLog(h)}
              />
            ))}
          </div>
        )}

        {habits.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              href="/habits/new"
              className="text-[11px] tracking-[0.22em] uppercase text-muted hover:text-ink transition-colors"
            >
              + Add another
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

function HabitRow({
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
  const fulfilled = isFulfilled(habit, entry?.value);

  return (
    <article className="border-b hairline py-7">
      <header className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: habit.color }}
            aria-hidden
          />
          <span className="text-xl leading-none">{habit.emoji}</span>
          <h2 className="serif italic text-2xl leading-tight">{habit.name}</h2>
        </div>
        {done && (
          <button
            onClick={onClear}
            className="kicker hover:text-ink transition-colors"
            aria-label={`Clear ${habit.name}`}
          >
            Clear
          </button>
        )}
      </header>

      <HabitControl
        key={entry?.id ?? "empty"}
        habit={habit}
        entry={entry}
        fulfilled={fulfilled}
        onLog={onLog}
      />
    </article>
  );
}

function HabitControl({
  habit,
  entry,
  fulfilled,
  onLog,
}: {
  habit: Habit;
  entry?: Entry;
  fulfilled: boolean;
  onLog: (v: number) => void;
}) {
  const [val, setVal] = useState<number>(
    entry ? Number(entry.value) : Number(habit.min_value) || 0,
  );

  if (habit.input_type === "checkbox") {
    const on = entry !== undefined && Number(entry.value) > 0;
    return (
      <button
        onClick={() => onLog(on ? 0 : 1)}
        className="w-full flex items-baseline justify-between gap-4 group"
      >
        <span
          className="serif tabular text-7xl leading-none"
          style={{ color: on ? habit.color : "var(--ink-soft)" }}
        >
          {on ? "✓" : "—"}
        </span>
        <span className="kicker text-right">
          {on ? "done" : "mark complete"}
        </span>
      </button>
    );
  }

  if (habit.input_type === "counter") {
    const step = Number(habit.step) || 1;
    return (
      <div className="flex items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span
            className="serif tabular text-7xl leading-none"
            style={{ color: fulfilled ? habit.color : "var(--ink)" }}
          >
            {val}
          </span>
          {habit.unit && (
            <span className="text-muted text-sm lowercase">{habit.unit}</span>
          )}
          {habit.target !== null && habit.target !== undefined && (
            <span className="kicker">/ {habit.target}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StepButton
            label="−"
            onClick={() => {
              const v = Math.max(0, val - step);
              setVal(v);
              onLog(v);
            }}
          />
          <StepButton
            label="+"
            color={habit.color}
            onClick={() => {
              const v = val + step;
              setVal(v);
              onLog(v);
            }}
          />
        </div>
      </div>
    );
  }

  if (habit.input_type === "slider") {
    return (
      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-3">
            <span
              className="serif tabular text-7xl leading-none"
              style={{ color: fulfilled ? habit.color : "var(--ink)" }}
            >
              {val}
            </span>
            {habit.unit && (
              <span className="text-muted text-sm lowercase">{habit.unit}</span>
            )}
          </div>
          <span className="kicker">
            {habit.target !== null && habit.target !== undefined
              ? `/ ${habit.target}`
              : `${habit.min_value}–${habit.max_value}`}
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
          style={{ ["--thumb" as string]: habit.color }}
        />
      </div>
    );
  }

  // number — hero editable input, autosaves on blur
  return (
    <div className="flex items-baseline justify-between gap-4">
      <div className="flex items-baseline gap-3">
        <input
          className="hero serif tabular text-7xl leading-none bg-transparent outline-none w-[4ch]"
          type="number"
          inputMode="decimal"
          value={val}
          step={habit.step || 1}
          onChange={(e) => setVal(Number(e.target.value))}
          onBlur={() => onLog(val)}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          style={{ color: fulfilled ? habit.color : "var(--ink)" }}
        />
        {habit.unit && (
          <span className="text-muted text-sm lowercase">{habit.unit}</span>
        )}
        {habit.target !== null && habit.target !== undefined && (
          <span className="kicker">/ {habit.target}</span>
        )}
      </div>
      <span className="kicker">saves on blur</span>
    </div>
  );
}

function StepButton({
  label,
  onClick,
  color,
}: {
  label: string;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-11 h-11 rounded-full border hairline text-lg leading-none transition-colors hover:bg-ink hover:text-paper active:scale-95"
      style={
        color
          ? { borderColor: color, color: "var(--ink)" }
          : undefined
      }
    >
      {label}
    </button>
  );
}
