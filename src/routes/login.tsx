import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : "/campaign",
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    const target = redirect.startsWith("/") ? redirect : "/campaign";
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + target,
    });
    if (result.error) {
      setError(result.error.message ?? "Falha ao entrar com Google");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    if (typeof window !== "undefined") {
      window.location.replace(target);
    } else {
      navigate({ to: "/campaign", replace: true });
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#1c0d52 0%,#0b052b 100%)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Fredoka', system-ui, sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "linear-gradient(180deg,#3a1f8a,#2a1565)",
          border: "2px solid #4a2aa6",
          padding: 36,
          borderRadius: 18,
          width: "100%",
          maxWidth: 400,
          textAlign: "center",
          boxShadow: "0 12px 0 rgba(0,0,0,.35), 0 24px 60px rgba(0,0,0,.45)",
        }}
      >
        <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 8 }}>🎢</div>
        <h1
          style={{
            margin: "0 0 4px",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: ".5px",
          }}
        >
          Crash Coaster
        </h1>
        <p style={{ margin: "0 0 24px", opacity: 0.75, fontSize: 13, color: "#B7AEE0" }}>
          Construa. Destrua. Compartilhe.
        </p>
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: 12,
            border: "none",
            background: "#fff",
            color: "#1f1f1f",
            fontWeight: 700,
            fontSize: 15,
            fontFamily: "inherit",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            boxShadow: "0 4px 0 rgba(0,0,0,.3)",
            transition: "transform .08s ease",
            opacity: loading ? 0.7 : 1,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.3 0-11.5-5.1-11.5-11.5S17.7 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.7 6.4 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.7 6.4 29.1 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 43.5c5 0 9.6-1.9 13.1-5l-6.1-5c-2 1.4-4.4 2.2-7 2.2-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39 16.3 43.5 24 43.5z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.1 5c-.4.4 6.7-4.9 6.7-14.5 0-1.2-.1-2.4-.4-3.5z"
            />
          </svg>
          {loading ? "Abrindo Google…" : "Entrar com Google"}
        </button>
        {error && (
          <p style={{ color: "#ff8080", fontSize: 13, marginTop: 14 }}>
            {error}
          </p>
        )}
        <p style={{ marginTop: 22, fontSize: 12, color: "#B7AEE0" }}>
          Novo por aqui?{" "}
          <a
            href="/home.html"
            style={{ color: "#FF6BD6", textDecoration: "none", fontWeight: 600 }}
          >
            Como funciona →
          </a>
        </p>
      </div>
    </div>
  );
}
