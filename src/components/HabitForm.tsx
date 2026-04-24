"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Habit, InputType } from "@/lib/types";

const COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

const EMOJI_SUGGESTIONS = [
  "💧","🏃","🧘","📚","💤","🥗","🚭","💊","🎯","💪",
  "🌱","☀️","🧠","✍️","🎨","🎸","🧹","💰","📵","🌊",
  "☕","🍎","🏋️","🚶","🧴","🦷","📖","🎧","🔥","⭐",
];

export default function HabitForm({ habit }: { habit?: Habit }) {
  const router = useRouter();
  const [name, setName] = useState(habit?.name ?? "");
  const [emoji, setEmoji] = useState(habit?.emoji ?? "✨");
  const [color, setColor] = useState(habit?.color ?? COLORS[0]);
  const [inputType, setInputType] = useState<InputType>(habit?.input_type ?? "checkbox");
  const [unit, setUnit] = useState(habit?.unit ?? "");
  const [minValue, setMinValue] = useState(String(habit?.min_value ?? 0));
  const [maxValue, setMaxValue] = useState(String(habit?.max_value ?? 10));
  const [step, setStep] = useState(String(habit?.step ?? 1));
  const [target, setTarget] = useState(
    habit?.target !== null && habit?.target !== undefined ? String(habit.target) : "",
  );
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = {
      name,
      emoji,
      color,
      input_type: inputType,
      unit: unit || null,
      min_value: Number(minValue) || 0,
      max_value: Number(maxValue) || 10,
      step: Number(step) || 1,
      target: target === "" ? null : Number(target),
    };
    const res = habit
      ? await fetch(`/api/habits/${habit.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      : await fetch("/api/habits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
    if (res.ok) {
      router.push("/habits");
      router.refresh();
    } else {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <Field label="Name">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Drink water"
          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
        />
      </Field>

      <Field label="Emoji">
        <div className="flex gap-2 items-center flex-wrap">
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            maxLength={4}
            className="w-20 px-3 py-3 text-center text-2xl rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
          />
          <div className="flex flex-wrap gap-1">
            {EMOJI_SUGGESTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className="text-2xl p-1 hover:scale-110 transition"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </Field>

      <Field label="Color">
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={c}
              className={`w-10 h-10 rounded-full transition ${
                color === c ? "ring-2 ring-offset-2 ring-zinc-400" : ""
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </Field>

      <Field label="Tracking type">
        <div className="grid grid-cols-2 gap-2">
          {(["checkbox", "counter", "slider", "number"] as InputType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setInputType(t)}
              className={`px-4 py-3 rounded-xl font-medium text-sm capitalize transition ${
                inputType === t
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Field>

      {inputType !== "checkbox" && (
        <>
          <Field label="Unit (optional)">
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="glasses, min, km…"
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
            />
          </Field>

          {inputType === "slider" && (
            <div className="grid grid-cols-3 gap-3">
              <Field label="Min">
                <input
                  type="number"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                />
              </Field>
              <Field label="Max">
                <input
                  type="number"
                  value={maxValue}
                  onChange={(e) => setMaxValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                />
              </Field>
              <Field label="Step">
                <input
                  type="number"
                  value={step}
                  onChange={(e) => setStep(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                />
              </Field>
            </div>
          )}

          {(inputType === "counter" || inputType === "number") && (
            <Field label="Step">
              <input
                type="number"
                value={step}
                onChange={(e) => setStep(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
              />
            </Field>
          )}

          <Field label="Daily target (optional)">
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. 8"
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
            />
          </Field>
        </>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !name}
          className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-medium disabled:opacity-50"
        >
          {saving ? "Saving…" : habit ? "Save" : "Create"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
