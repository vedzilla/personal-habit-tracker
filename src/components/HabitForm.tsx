"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Habit, InputType } from "@/lib/types";

const COLORS = [
  "#9e3a2f", "#b8693d", "#c49a3c", "#7d8837",
  "#4a7a4a", "#3d7a6e", "#3f6d85", "#4d5c91",
  "#6d4988", "#8a3a60", "#6e3d42", "#5e493a",
  "#a68a6d", "#c5a882", "#8a8272", "#2d2a26",
];

const EMOJI_SUGGESTIONS = [
  "💧","🏃","🧘","📚","💤","🥗","🚭","💊","🎯","💪",
  "🌱","☀️","🧠","✍️","🎨","🎸","🧹","💰","📵","🌊",
  "☕","🍎","🏋️","🚶","🧴","🦷","📖","🎧","🔥","⭐",
];

const TYPE_COPY: Record<InputType, string> = {
  checkbox: "a yes or no",
  counter: "tally by step",
  slider: "slide a range",
  number: "any number",
};

export default function HabitForm({ habit }: { habit?: Habit }) {
  const router = useRouter();
  const [name, setName] = useState(habit?.name ?? "");
  const [emoji, setEmoji] = useState(habit?.emoji ?? "✨");
  const [color, setColor] = useState(habit?.color ?? COLORS[3]);
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
    <form onSubmit={save} className="space-y-10">
      <Section label="The name">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="drink water, walk, read, …"
          className="field serif italic text-3xl"
        />
      </Section>

      <Section label="Mark it">
        <div className="flex items-center gap-3 flex-wrap">
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            maxLength={4}
            className="w-16 h-16 text-center text-3xl bg-transparent border hairline rounded-full"
          />
          <div className="flex flex-wrap gap-1.5 flex-1">
            {EMOJI_SUGGESTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`text-xl w-8 h-8 rounded-full transition ${
                  emoji === e ? "bg-[color:var(--surface)]" : "hover:scale-110"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section label="Its shade">
        <div className="grid grid-cols-8 gap-3">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={c}
              className={`aspect-square rounded-full transition ${
                color === c
                  ? "ring-2 ring-offset-2 ring-[color:var(--ink)] ring-offset-[color:var(--paper)]"
                  : "hover:scale-110"
              }`}
              style={{ background: c }}
            />
          ))}
        </div>
      </Section>

      <Section label="How you'll log it">
        <div className="grid grid-cols-2 gap-px bg-[color:var(--line)] border hairline">
          {(["checkbox", "counter", "slider", "number"] as InputType[]).map(
            (t) => (
              <button
                key={t}
                type="button"
                onClick={() => setInputType(t)}
                className={`px-4 py-4 text-left transition-colors ${
                  inputType === t
                    ? "bg-[color:var(--ink)] text-[color:var(--paper)]"
                    : "bg-[color:var(--paper)] hover:bg-[color:var(--surface)]"
                }`}
              >
                <div className="serif italic text-lg capitalize leading-none">
                  {t}
                </div>
                <div
                  className={`text-[11px] tracking-[0.15em] uppercase mt-2 ${
                    inputType === t ? "opacity-70" : "text-soft"
                  }`}
                >
                  {TYPE_COPY[t]}
                </div>
              </button>
            ),
          )}
        </div>
      </Section>

      {inputType !== "checkbox" && (
        <Section label="Its shape">
          <div className="space-y-6">
            <div>
              <span className="kicker block mb-1">Unit</span>
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="glasses, min, km, pages…"
                className="field"
              />
            </div>

            {inputType === "slider" && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="kicker block mb-1">Min</span>
                  <input
                    type="number"
                    value={minValue}
                    onChange={(e) => setMinValue(e.target.value)}
                    className="field"
                  />
                </div>
                <div>
                  <span className="kicker block mb-1">Max</span>
                  <input
                    type="number"
                    value={maxValue}
                    onChange={(e) => setMaxValue(e.target.value)}
                    className="field"
                  />
                </div>
                <div>
                  <span className="kicker block mb-1">Step</span>
                  <input
                    type="number"
                    value={step}
                    onChange={(e) => setStep(e.target.value)}
                    className="field"
                  />
                </div>
              </div>
            )}

            {(inputType === "counter" || inputType === "number") && (
              <div>
                <span className="kicker block mb-1">Step</span>
                <input
                  type="number"
                  value={step}
                  onChange={(e) => setStep(e.target.value)}
                  className="field"
                />
              </div>
            )}

            <div>
              <span className="kicker block mb-1">Target (optional)</span>
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. 8"
                className="field"
              />
            </div>
          </div>
        </Section>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 border hairline py-3 text-[11px] tracking-[0.22em] uppercase hover:bg-[color:var(--surface)] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !name}
          className="flex-[2] py-3 text-[11px] tracking-[0.22em] uppercase bg-[color:var(--ink)] text-[color:var(--paper)] hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          {saving ? "Saving…" : habit ? "Save changes" : "Create habit"}
        </button>
      </div>
    </form>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="kicker mb-4">{label}</div>
      {children}
    </section>
  );
}
