'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Fatal application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#050505',
          color: '#f7f5f8',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          padding: '2rem',
        }}
      >
        <div style={{ maxWidth: '32rem', textAlign: 'center' }}>
          <p
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#ff79ee',
              fontWeight: 600,
              margin: 0,
            }}
          >
            BlackTuf Technologies
          </p>
          <h1
            style={{
              fontSize: '2rem',
              lineHeight: 1.1,
              letterSpacing: '-0.04em',
              margin: '1rem 0 0',
            }}
          >
            The site could not load.
          </h1>
          <p style={{ marginTop: '1rem', color: '#a1a0a8', lineHeight: 1.7, fontSize: '0.95rem' }}>
            A critical error interrupted the page. Please reload, or try again in a moment.
          </p>
          {error.digest ? (
            <p style={{ marginTop: '0.75rem', color: '#73727b', fontSize: '0.7rem' }}>
              Reference: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '1.75rem',
              border: 'none',
              borderRadius: '0.9rem',
              padding: '0.85rem 1.4rem',
              background: '#ff79ee',
              color: '#180514',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
