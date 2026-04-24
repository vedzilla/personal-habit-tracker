"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("error") ? "Try again." : null,
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        window.location.href = "/";
      } else {
        setError("Try again.");
        setLoading(false);
      }
    } catch {
      // JS fetch blocked — let the native form submit instead
      (e.target as HTMLFormElement).submit();
    }
  }

  return (
    <form
      action="/api/login"
      method="POST"
      onSubmit={onSubmit}
      className="space-y-6"
    >
      <input
        type="password"
        name="password"
        autoFocus
        autoComplete="current-password"
        enterKeyHint="go"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
        className="field text-center text-lg"
      />
      {error && (
        <div className="text-center text-xs tracking-[0.2em] uppercase text-muted">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full border hairline py-3 text-[11px] tracking-[0.22em] uppercase disabled:opacity-40 hover:bg-ink hover:text-paper transition-colors"
      >
        {loading ? "·  ·  ·" : "Enter"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen grain flex items-center justify-center px-6">
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-12">
          <p className="kicker mb-3">A personal journal</p>
          <h1 className="serif italic text-6xl leading-none">habits.</h1>
          <p className="text-muted text-sm mt-3">
            a quiet log of the things you do.
          </p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
