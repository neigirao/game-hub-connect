import { createFileRoute } from "@tanstack/react-router";
import { PageError, PulseSkeleton } from "@/components/page-error";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/campaign")({
  head: () => ({
    meta: [
      { title: "Campanha — Crash Coaster" },
      { name: "description", content: "Jogue as fases da campanha de Crash Coaster. Construa pistas para cada desafio, lance o carrinho e conquiste até 3 estrelas por fase." },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://crashcoaster.app/" },
            { "@type": "ListItem", "position": 2, "name": "Campanha", "item": "https://crashcoaster.app/campaign" },
          ],
        }),
      },
    ],
  }),
  component: CampaignPage,
});

type Level = {
  id: number;
  title: string;
  description: string;
  scenario: string;
  order_index: number;
  star1_score: number;
  star2_score: number;
  star3_score: number;
  objectives: Array<{ type: string; label: string }>;
  reward_coins: number;
  reward_xp: number;
  starter_track: { nodes: Array<{ x: number; y: number; kind: string }>; loop: boolean };
};

const SCENARIO_EMOJI: Record<string, string> = {
  parque: "🎡",
  montanha: "⛰️",
  vulcao: "🌋",
  praia: "🏖️",
  espaco: "🚀",
};

const SCENARIO_GRADIENT: Record<string, string> = {
  parque: "linear-gradient(135deg,#2ED573 0%,#1a6e3a 100%)",
  montanha: "linear-gradient(135deg,#70A1FF 0%,#1a3a8a 100%)",
  vulcao: "linear-gradient(135deg,#FF4757 0%,#8a1a1a 100%)",
  praia: "linear-gradient(135deg,#FFA502 0%,#8a5200 100%)",
  espaco: "linear-gradient(135deg,#FF6BD6 0%,#4a0a6e 100%)",
};

const S = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#1c0d52 0%,#0b052b 100%)",
    color: "#fff",
    fontFamily: "'Inter',system-ui,sans-serif",
    WebkitFontSmoothing: "antialiased" as const,
  },
  navbar: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "0 24px",
    height: 64,
    background: "linear-gradient(180deg,#3a1f8a,#2a1565)",
    borderBottom: "2px solid #4a2aa6",
    boxShadow: "0 4px 0 rgba(0,0,0,.3)",
  },
  navLogo: {
    fontFamily: "'Fredoka',system-ui,sans-serif",
    fontWeight: 700,
    fontSize: 18,
    letterSpacing: ".5px",
    textDecoration: "none",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  navBadge: {
    width: 32, height: 32, borderRadius: 9,
    background: "conic-gradient(from 220deg,#FFA502,#FF6BD6,#70A1FF,#2ED573,#FFA502)",
    boxShadow: "0 2px 0 #1a0a48",
    flexShrink: 0,
  },
  navLink: {
    fontFamily: "'Fredoka',system-ui,sans-serif",
    fontWeight: 600,
    fontSize: 14,
    color: "#B7AEE0",
    textDecoration: "none",
    padding: "6px 12px",
    borderRadius: 10,
  },
  navLinkActive: {
    background: "rgba(255,107,214,.15)",
    color: "#FF6BD6",
  },
  content: {
    maxWidth: 960,
    margin: "0 auto",
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 32,
  },
};

function StarBar({ score, s1, s2, s3 }: { score: number; s1: number; s2: number; s3: number }) {
  const stars = score >= s3 ? 3 : score >= s2 ? 2 : score >= s1 ? 1 : 0;
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {[1, 2, 3].map((n) => (
        <span key={n} style={{ fontSize: 18, opacity: stars >= n ? 1 : 0.25, filter: stars >= n ? "drop-shadow(0 0 4px #FFA502)" : "none" }}>
          ★
        </span>
      ))}
    </div>
  );
}

function MiniTrack({ nodes, loop }: { nodes: Array<{ x: number; y: number; kind: string }>; loop: boolean }) {
  if (!nodes || nodes.length < 2) return null;

  const PAD = 8;
  const W = 160, H = 70;
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const sx = (x: number) => PAD + ((x - minX) / rangeX) * (W - PAD * 2);
  const sy = (y: number) => PAD + ((y - minY) / rangeY) * (H - PAD * 2);

  const nodeColor = (kind: string) =>
    kind === "booster" ? "#FFA502"
    : kind === "brake" ? "#FF4757"
    : kind === "launcher" ? "#2ED573"
    : kind === "loop" ? "#FF6BD6"
    : "rgba(255,255,255,0.4)";

  const pts = nodes.map((n) => `${sx(n.x)},${sy(n.y)}`).join(" ");

  return (
    <svg width={W} height={H} style={{ opacity: 0.8 }}>
      <polyline
        points={pts}
        fill="none"
        stroke="#FFE9A8"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {loop && nodes.length > 0 && (
        <line
          x1={sx(nodes[nodes.length - 1].x)} y1={sy(nodes[nodes.length - 1].y)}
          x2={sx(nodes[0].x)} y2={sy(nodes[0].y)}
          stroke="#FFE9A8" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.5}
        />
      )}
      {nodes.map((n, i) => {
        const col = nodeColor(n.kind);
        if (i === 0) return <circle key={i} cx={sx(n.x)} cy={sy(n.y)} r={4} fill="#FFA502" stroke="#0E0726" strokeWidth={1} />;
        if (n.kind !== "normal") return <circle key={i} cx={sx(n.x)} cy={sy(n.y)} r={3} fill={col} stroke="#0E0726" strokeWidth={1} />;
        return null;
      })}
    </svg>
  );
}

function LevelCard({ level, index, bestScore }: { level: Level; index: number; bestScore: number }) {
  const gradient = SCENARIO_GRADIENT[level.scenario] ?? "linear-gradient(135deg,#4a2aa6,#2a1565)";
  const emoji = SCENARIO_EMOJI[level.scenario] ?? "🎢";
  const trackUrl = `/play.html?level=${level.id}`;

  const diffLabel = index === 0 ? "Fácil" : index === 1 ? "Médio" : "Difícil";
  const diffColor = index === 0 ? "#2ED573" : index === 1 ? "#FFA502" : "#FF4757";

  return (
    <div
      style={{
        background: "linear-gradient(180deg,#2e1870,#1a0e50)",
        border: "2px solid #4a2aa6",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 8px 0 rgba(0,0,0,.35)",
        display: "flex",
        flexDirection: "column" as const,
        animation: `slideIn .3s ease both`,
        animationDelay: `${index * 0.1}s`,
      }}
    >
      {/* Scenario banner */}
      <div
        style={{
          background: gradient,
          padding: "24px 24px 16px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          position: "relative" as const,
        }}
      >
        <div style={{ fontSize: 52, lineHeight: 1, filter: "drop-shadow(0 4px 8px rgba(0,0,0,.4))" }}>
          {emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{
              fontFamily: "'Fredoka',system-ui,sans-serif",
              fontWeight: 700, fontSize: 11,
              padding: "2px 10px", borderRadius: 20,
              background: "rgba(0,0,0,.3)", color: diffColor,
              border: `1px solid ${diffColor}`,
            }}>
              {diffLabel}
            </span>
            <span style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 600, fontSize: 11, color: "rgba(255,255,255,.6)" }}>
              Fase {level.order_index}
            </span>
          </div>
          <h2 style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 22, margin: 0, lineHeight: 1.1 }}>
            {level.title}
          </h2>
        </div>
        {/* Mini track preview */}
        <div style={{ flexShrink: 0, opacity: 0.8 }}>
          <MiniTrack nodes={level.starter_track?.nodes ?? []} loop={level.starter_track?.loop ?? false} />
        </div>
      </div>

      <div style={{ padding: "16px 24px 20px", display: "flex", flexDirection: "column" as const, gap: 16, flex: 1 }}>
        <p style={{ margin: 0, fontSize: 13, color: "#B7AEE0", lineHeight: 1.5 }}>
          {level.description}
        </p>

        {/* Objectives */}
        <div>
          <div style={{ fontSize: 10, letterSpacing: "1px", textTransform: "uppercase" as const, color: "#B7AEE0", fontWeight: 600, marginBottom: 8 }}>
            Objetivos
          </div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 4 }}>
            {level.objectives.map((obj, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12, color: "#e0d8ff" }}>
                <span style={{ color: "#FF6BD6", flexShrink: 0, marginTop: 1 }}>▸</span>
                {obj.label}
              </div>
            ))}
          </div>
        </div>

        {/* Stars threshold + current best */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" as const }}>
          <div style={{ display: "flex", gap: 12, fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: "#B7AEE0" }}>
            <span>⭐ {level.star1_score}+</span>
            <span>⭐⭐ {level.star2_score}+</span>
            <span>⭐⭐⭐ {level.star3_score}+</span>
          </div>
          <StarBar score={bestScore} s1={level.star1_score} s2={level.star2_score} s3={level.star3_score} />
        </div>

        {/* Rewards + CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: "auto" }}>
          <div style={{ display: "flex", gap: 10, fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: "#B7AEE0", flex: 1 }}>
            <span>🪙 +{level.reward_coins}</span>
            <span>✨ +{level.reward_xp} XP</span>
          </div>
          <a
            href={trackUrl}
            style={{
              fontFamily: "'Fredoka',system-ui,sans-serif",
              fontWeight: 700, fontSize: 16,
              padding: "10px 28px",
              borderRadius: 14,
              background: "linear-gradient(180deg,#FFA502,#c97a00)",
              border: "2px solid #FFCB6B",
              color: "#fff", textDecoration: "none",
              boxShadow: "0 4px 0 #6e3f00",
              display: "flex", alignItems: "center", gap: 8,
              transition: "transform .1s ease",
              whiteSpace: "nowrap" as const,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            Jogar
          </a>
        </div>
      </div>
    </div>
  );
}

export function CampaignPage() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [bestScores, setBestScores] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const uid = session?.user.id ?? null;
        setUserId(uid);

        const [lvlsRes, scoresRes] = await Promise.all([
          supabase
            .from("levels")
            .select("*")
            .eq("is_published", true)
            .order("order_index", { ascending: true }),
          uid
            ? supabase
                .from("leaderboard_entries")
                .select("level_id, total_score")
                .eq("user_id", uid)
                .not("level_id", "is", null)
            : Promise.resolve({ data: [] }),
        ]);

        if (lvlsRes.error) throw lvlsRes.error;

        setLevels((lvlsRes.data ?? []) as Level[]);

        const map: Record<number, number> = {};
        for (const row of (scoresRes.data ?? []) as Array<{ level_id: number; total_score: number }>) {
          if (row.level_id != null) {
            map[row.level_id] = Math.max(map[row.level_id] ?? 0, row.total_score);
          }
        }
        setBestScores(map);
        setLoading(false);
      } catch {
        setError("Não foi possível carregar as fases. Verifique sua conexão.");
        setLoading(false);
      }
    }
    load();
  }, [retryCount]);

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.9} }
        @keyframes slideIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={S.content}>
        {/* Header */}
        <div>
          <h1 style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 36, margin: 0, lineHeight: 1 }}>
            🗺️ Campanha
          </h1>
          <p style={{ color: "#B7AEE0", fontSize: 15, marginTop: 8, marginBottom: 0 }}>
            Enfrente as fases do Crash Coaster e prove que você aguenta o caos.
          </p>
        </div>

        {/* Level grid */}
        {error ? (
          <PageError message={error} onRetry={() => setRetryCount((c) => c + 1)} />
        ) : loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 24 }}>
            {[0, 1, 2].map((i) => (
              <PulseSkeleton key={i} height={380} borderRadius={24} delay={i * 0.15} />
            ))}
          </div>
        ) : levels.length === 0 ? (
          <div style={{
            background: "linear-gradient(180deg,#2e1870,#1a0e50)",
            border: "2px solid #4a2aa6", borderRadius: 20, padding: 48,
            textAlign: "center", color: "#B7AEE0",
          }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🚧</div>
            <div style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 20, color: "#fff" }}>
              Fases em construção!
            </div>
            <div style={{ fontSize: 14, marginTop: 8 }}>
              Volte em breve para novas aventuras.
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 24 }}>
            {levels.map((level, i) => (
              <LevelCard
                key={level.id}
                level={level}
                index={i}
                bestScore={bestScores[level.id] ?? 0}
              />
            ))}
          </div>
        )}

        {!loading && levels.length > 0 && !userId && (
          <div style={{ textAlign: "center", padding: "12px 0", color: "#B7AEE0", fontSize: 13 }}>
            <a href="/login" style={{ color: "#FF6BD6", textDecoration: "none", fontWeight: 700 }}>Faça login</a> para salvar seu progresso e aparecer no ranking.
          </div>
        )}
      </div>
    </div>
  );
}
