"use client";
import { useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      window.location.href = "/";
    } else {
      setError("Wrong password");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-rose-50 dark:from-zinc-950 dark:to-zinc-900">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 space-y-4"
      >
        <div className="text-center">
          <div className="text-5xl mb-2">🌱</div>
          <h1 className="text-2xl font-semibold">Habit Tracker</h1>
          <p className="text-sm text-zinc-500 mt-1">Enter password to continue</p>
        </div>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {error && <div className="text-sm text-rose-600">{error}</div>}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium transition"
        >
          {loading ? "Checking…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
