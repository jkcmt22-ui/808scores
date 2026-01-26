"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body style={{
        backgroundColor: "#0a0a12",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        margin: 0,
        padding: "1rem",
      }}>
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <div style={{
            fontSize: "4rem",
            marginBottom: "1rem",
            textShadow: "0 0 20px #ff2a6d",
          }}>
            ⚠️
          </div>
          <h1 style={{
            fontSize: "1.5rem",
            marginBottom: "0.5rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}>
            Something went wrong
          </h1>
          <p style={{
            color: "#a0a0b0",
            marginBottom: "1rem",
            fontSize: "0.875rem",
          }}>
            We hit an unexpected error. Our team has been notified.
          </p>
          {error.digest && (
            <p style={{
              color: "#606070",
              marginBottom: "1.5rem",
              fontSize: "0.75rem",
              fontFamily: "monospace",
            }}>
              Error ID: {error.digest}
            </p>
          )}
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => reset()}
              style={{
                backgroundColor: "#ff2a6d",
                color: "#000",
                border: "none",
                padding: "0.75rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: "pointer",
                boxShadow: "0 0 15px #ff2a6d",
              }}
            >
              Try Again
            </button>
            <a
              href="/"
              style={{
                backgroundColor: "transparent",
                color: "#a0a0b0",
                border: "1px solid #404050",
                padding: "0.75rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
