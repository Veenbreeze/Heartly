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
              fontSize: 30,
            }}
          >
            ♥
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
