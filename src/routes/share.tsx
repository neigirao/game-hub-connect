import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/share")({
  validateSearch: (search: Record<string, unknown>) => ({
    score: Math.max(0, Number(search.score ?? 0)),
    stars: Math.min(3, Math.max(0, Number(search.stars ?? 0))),
    speed: Math.max(0, Number(search.speed ?? 0)),
    g: Math.max(0, Number(search.g ?? 0)),
    s: Math.min(100, Math.max(0, Number(search.s ?? 0))),
    a: Math.min(100, Math.max(0, Number(search.a ?? 0))),
    c: Math.min(100, Math.max(0, Number(search.c ?? 0))),
  }),
  head: ({ match }) => {
    const search = match.search as {
      score: number;
      stars: number;
      speed: number;
      g: number;
    };
    const ogImage = `/api/og/share?score=${search.score}&stars=${search.stars}&speed=${search.speed}&g=${search.g}`;
    const starEmoji = "⭐".repeat(Math.min(3, search.stars));
    const title = `${search.score} pts ${starEmoji} — Crash Coaster 🎢`;
    const description = `Velocidade: ${search.speed} km/h · G-force: ${search.g}G. Você consegue superar?`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:image", content: ogImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
      ],
    };
  },
  component: SharePage,
});

const STAR_LABELS = ["Sem estrelas", "Bronze", "Prata", "Ouro"];
const STAR_COLORS = ["#B7AEE0", "#CD7F32", "#C0C0C0", "#FFA502"];

function SharePage() {
  const { score, stars, speed, g, s, a, c } = Route.useSearch();
  const [copied, setCopied] = useState(false);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const whatsappText = encodeURIComponent(
    `Consegui ${score} pontos em Crash Coaster com ${stars} estrela${stars !== 1 ? "s" : ""}! Velocidade: ${speed} km/h, G-force: ${g}G. Venha superar: ${currentUrl}`,
  );
  const twitterText = encodeURIComponent(
    `Consegui ${score} pts com ${"⭐".repeat(stars)} no Crash Coaster! 🎢 ${speed}km/h · ${g}G · Venha superar!`,
  );
  const twitterUrl = encodeURIComponent(currentUrl);

  function handleCopy() {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#1c0d52 0%,#0b052b 100%)",
        color: "#fff",
        fontFamily: "'Inter',system-ui,sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        gap: 24,
      }}
    >
      <style>{`
        @keyframes pop { 0%{transform:scale(.85);opacity:0} 70%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Logo */}
      <Link
        to="/"
        style={{
          textDecoration: "none",
          fontFamily: "'Fredoka',system-ui,sans-serif",
          fontWeight: 700,
          fontSize: 18,
          color: "#B7AEE0",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "conic-gradient(from 220deg,#FFA502,#FF6BD6,#70A1FF,#2ED573,#FFA502)",
            boxShadow: "0 2px 0 #1a0a48",
          }}
        />
        Crash Coaster
      </Link>

      {/* Score card */}
      <div
        style={{
          background: "linear-gradient(180deg,#2e1870,#1a0e50)",
          border: "2px solid #4a2aa6",
          borderRadius: 24,
          padding: "36px 40px",
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 8px 0 rgba(0,0,0,.35)",
          animation: "pop .4s cubic-bezier(.22,1,.36,1) both",
        }}
      >
        {/* Stars */}
        <div style={{ fontSize: 36, marginBottom: 8, letterSpacing: 4 }}>
          {"⭐".repeat(stars)}
          {"☆".repeat(Math.max(0, 3 - stars))}
        </div>
        <div
          style={{
            fontFamily: "'Fredoka',system-ui,sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: STAR_COLORS[stars] ?? "#B7AEE0",
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          {STAR_LABELS[stars] ?? ""}
        </div>

        {/* Total score */}
        <div
          style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontWeight: 700,
            fontSize: 72,
            color: "#FFA502",
            lineHeight: 1,
            textShadow: "0 4px 20px rgba(255,165,2,.4)",
          }}
        >
          {score}
        </div>
        <div
          style={{
            fontFamily: "'Fredoka',system-ui,sans-serif",
            color: "#B7AEE0",
            fontSize: 14,
            marginTop: 4,
            marginBottom: 24,
          }}
        >
          pontos
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 28,
          }}
        >
          {[
            { label: "Velocidade", value: `${speed} km/h`, color: "#70A1FF" },
            { label: "G-force", value: `${g}G`, color: "#FF4757" },
            { label: "Survival", value: s, color: "#2ED573" },
            { label: "Adrenaline", value: a, color: "#FF6BD6" },
            { label: "Chaos", value: c, color: "#FFA502" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "rgba(0,0,0,.3)",
                border: "2px solid rgba(255,255,255,.08)",
                borderRadius: 12,
                padding: "8px 14px",
                minWidth: 80,
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontWeight: 700,
                  fontSize: 18,
                  color: stat.color,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#B7AEE0",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginTop: 2,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Share buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={handleCopy}
            style={{
              fontFamily: "'Fredoka',system-ui,sans-serif",
              fontWeight: 700,
              fontSize: 15,
              padding: "12px",
              borderRadius: 14,
              background: copied
                ? "linear-gradient(180deg,#2ED573,#1a8a46)"
                : "linear-gradient(180deg,#FF6BD6,#a8329c)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              transition: "background .25s",
              width: "100%",
            }}
          >
            {copied ? "✓ Link copiado!" : "🔗 Copiar link"}
          </button>

          <div style={{ display: "flex", gap: 10 }}>
            <a
              href={`https://api.whatsapp.com/send?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                fontFamily: "'Fredoka',system-ui,sans-serif",
                fontWeight: 700,
                fontSize: 14,
                padding: "10px",
                borderRadius: 12,
                background: "rgba(37,211,102,.2)",
                color: "#25D366",
                border: "2px solid rgba(37,211,102,.35)",
                textDecoration: "none",
                textAlign: "center",
                display: "block",
              }}
            >
              WhatsApp
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${twitterText}&url=${twitterUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                fontFamily: "'Fredoka',system-ui,sans-serif",
                fontWeight: 700,
                fontSize: 14,
                padding: "10px",
                borderRadius: 12,
                background: "rgba(29,155,240,.2)",
                color: "#1D9BF0",
                border: "2px solid rgba(29,155,240,.35)",
                textDecoration: "none",
                textAlign: "center",
                display: "block",
              }}
            >
              Twitter / X
            </a>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ animation: "slideUp .5s ease .3s both", textAlign: "center" }}>
        <div
          style={{
            color: "#B7AEE0",
            fontSize: 14,
            marginBottom: 14,
            fontFamily: "'Fredoka',system-ui,sans-serif",
          }}
        >
          Você consegue superar esse score?
        </div>
        <a
          href="/play.html"
          style={{
            fontFamily: "'Fredoka',system-ui,sans-serif",
            fontWeight: 700,
            fontSize: 16,
            padding: "12px 32px",
            borderRadius: 16,
            background: "linear-gradient(180deg,#FFA502,#c97a00)",
            color: "#fff",
            textDecoration: "none",
            boxShadow: "0 4px 0 rgba(0,0,0,.3)",
            display: "inline-block",
          }}
        >
          🎢 Jogar agora
        </a>
      </div>
    </div>
  );
}
