"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          background: "#f6f1e7",
          color: "#18160f",
          fontFamily: "Georgia, serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 360 }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#a89f8b",
              marginBottom: 12,
            }}
          >
            Something broke
          </p>
          <h1
            style={{
              fontStyle: "italic",
              fontSize: 32,
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            The page couldn&apos;t finish loading.
          </h1>
          <p style={{ fontSize: 14, color: "#6b6456", marginBottom: 20 }}>
            {error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => reset()}
            style={{
              border: "1px solid #e4dcca",
              background: "transparent",
              color: "#18160f",
              padding: "10px 18px",
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
