"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen grain flex items-center justify-center px-6">
      <div className="relative z-10 max-w-sm w-full text-center">
        <p className="kicker mb-3">Something broke</p>
        <h1 className="serif italic text-4xl mb-4">
          The page couldn&apos;t finish loading.
        </h1>
        <p className="text-muted text-sm mb-6">
          {error?.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={() => reset()}
          className="inline-block border hairline px-5 py-2.5 text-[11px] tracking-[0.22em] uppercase hover:bg-ink hover:text-paper transition-colors"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
