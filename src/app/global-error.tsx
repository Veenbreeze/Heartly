"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff9f7",
          color: "#603b59",
          fontFamily: "Georgia, serif",
          padding: 24,
        }}
      >
        <main style={{ maxWidth: 560, textAlign: "center" }}>
          <div
            style={{
              width: 64,
              height: 64,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 20,
              background: "#fce7ef",
              color: "#e85d75",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 21s-7-4.35-9.5-8.5C.5 9 2.5 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 4 0 6 4 4 7.5C19 16.65 12 21 12 21z" />
            </svg>
          </div>
          <h1 style={{ marginTop: 28, fontSize: 36, lineHeight: 1.1 }}>
            Heartly could not load.
          </h1>
          <p
            style={{
              marginTop: 16,
              color: "#5f5560",
              fontFamily: "Arial, sans-serif",
              lineHeight: 1.6,
              fontSize: 15,
            }}
          >
            An unexpected error stopped the page from rendering. Please reload
            the page to try again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 28,
              border: 0,
              borderRadius: 999,
              padding: "12px 24px",
              background: "#e85d75",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload Heartly
          </button>
          {error.digest ? (
            <p
              style={{
                marginTop: 24,
                fontFamily: "monospace",
                fontSize: 10,
                color: "#5f5560",
              }}
            >
              Reference: {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
