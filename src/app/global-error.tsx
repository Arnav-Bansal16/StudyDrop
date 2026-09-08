"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
          background: "#f8f8f2",
          color: "#183027",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <main style={{ maxWidth: "32rem", textAlign: "center" }}>
          <p style={{ color: "#19633f", fontWeight: 700 }}>STUDYDROP</p>
          <h1
            style={{
              fontSize: "clamp(2rem, 7vw, 3.5rem)",
              lineHeight: 1,
              letterSpacing: "-0.04em",
            }}
          >
            Something went sideways.
          </h1>
          <p style={{ color: "#5d6d65", lineHeight: 1.6 }}>
            Your place is safe. Try loading this page again, or return home if
            the problem continues.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              minHeight: "44px",
              marginTop: "1rem",
              border: 0,
              borderRadius: "999px",
              padding: "0.75rem 1.25rem",
              background: "#19633f",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <Link
            href="/"
            style={{
              display: "block",
              marginTop: "1rem",
              color: "#19633f",
              fontWeight: 650,
              textUnderlineOffset: "0.2em",
            }}
          >
            Return home
          </Link>
        </main>
      </body>
    </html>
  );
}
