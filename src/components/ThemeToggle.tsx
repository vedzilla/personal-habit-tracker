"use client";
import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "auto";

const LABELS: Record<Theme, { glyph: string; title: string }> = {
  light: { glyph: "○", title: "Light mode" },
  dark: { glyph: "●", title: "Dark mode" },
  auto: { glyph: "◐", title: "Match system" },
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("auto");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (typeof window !== "undefined"
      ? (localStorage.getItem("theme") as Theme | null)
      : null) ?? "auto";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(stored);
    setMounted(true);
  }, []);

  function cycle() {
    const order: Theme[] = ["light", "dark", "auto"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
    if (next === "auto") {
      delete document.documentElement.dataset.theme;
      localStorage.removeItem("theme");
    } else {
      document.documentElement.dataset.theme = next;
      localStorage.setItem("theme", next);
    }
  }

  const { glyph, title } = LABELS[theme];
  return (
    <button
      onClick={cycle}
      aria-label={title}
      title={title}
      suppressHydrationWarning
      className="text-soft hover:text-ink transition-colors text-base leading-none w-5 text-center"
    >
      {mounted ? glyph : LABELS.auto.glyph}
    </button>
  );
}
