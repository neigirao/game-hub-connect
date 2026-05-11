import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageError } from "@/components/page-error";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Ranking Global — Crash Coaster" },
      { name: "description", content: "Top 50 corridas mais épicas do Crash Coaster. Veja score, velocidade máxima, G-force e as pistas usadas por cada jogador." },
    ],
  }),
  component: LeaderboardPage,
});

type LeaderboardRow = {
  id: string;
  user_id: string;
  username: string | null;
  total_score: number;
  survival_rate: number;
  adrenaline_score: number;
  chaos_score: number;
  max_g_force: number;
  max_speed_kmh: number;
  laps_completed: number;
  season: string;
  rank: number;
  blueprint_id?: string | null;
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
  navSpacer: { flex: 1 },
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
    gap: 24,
  },
  card: {
    background: "linear-gradient(180deg,#2e1870,#1a0e50)",
    border: "2px solid #4a2aa6",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 6px 0 rgba(0,0,0,.3)",
  },
};

const MEDAL = ["🥇", "🥈", "🥉"];

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{MEDAL[rank - 1]}</span>
    );
  }
  return (
    <span style={{
      fontFamily: "'JetBrains Mono',monospace",
      fontWeight: 700,
      fontSize: 14,
      color: "#B7AEE0",
      width: 28,
      textAlign: "right" as const,
      flexShrink: 0,
    }}>
      #{rank}
    </span>
  );
}

function LeaderboardRow({
  row,
  isCurrentUser,
}: {
  row: LeaderboardRow;
  isCurrentUser: boolean;
}) {
  const stars =
    row.total_score > 75 ? "★★★" : row.total_score > 55 ? "★★☆" : row.total_score > 25 ? "★☆☆" : "☆☆☆";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderRadius: 14,
        background: isCurrentUser
          ? "linear-gradient(90deg,rgba(255,107,214,.18),rgba(112,161,255,.12))"
          : "rgba(0,0,0,.25)",
        border: isCurrentUser ? "2px solid #FF6BD6" : "2px solid #4a2aa6",
        transition: "background .15s",
      }}
    >
      <RankBadge rank={row.rank} />

      {/* Avatar initials */}
      <div
        style={{
          width: 36, height: 36, borderRadius: "50%",
          background: isCurrentUser
            ? "linear-gradient(135deg,#FF6BD6,#70A1FF)"
            : "linear-gradient(135deg,#4a2aa6,#2a1565)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Fredoka',system-ui,sans-serif",
          fontWeight: 700, fontSize: 14, color: "#fff",
          flexShrink: 0, border: "2px solid rgba(255,255,255,.15)",
        }}
      >
        {(row.username ?? "?")[0]?.toUpperCase()}
      </div>

      {/* Name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'Fredoka',system-ui,sans-serif",
          fontWeight: 700, fontSize: 15,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          color: isCurrentUser ? "#FF6BD6" : "#fff",
        }}>
          {row.username ?? "Anônimo"} {isCurrentUser && <span style={{ fontSize: 11, opacity: .7 }}>(você)</span>}
        </div>
        <div style={{ display: "flex", gap: 8, fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: "#B7AEE0", flexWrap: "wrap" as const, marginTop: 2 }}>
          <span style={{ color: "#2ED573" }}>S:{row.survival_rate}</span>
          <span style={{ color: "#FF4757" }}>A:{row.adrenaline_score}</span>
          <span style={{ color: "#FF7F50" }}>C:{row.chaos_score}</span>
          <span>⚡{row.max_speed_kmh}km/h</span>
          <span>💀{row.max_g_force}G</span>
          {row.laps_completed > 0 && <span>🔄{row.laps_completed}v</span>}
        </div>
      </div>

      {/* Blueprint link */}
      {row.blueprint_id && (
        <a
          href={`/play.html?blueprint=${row.blueprint_id}`}
          title="Jogar esta pista"
          style={{
            flexShrink: 0,
            fontSize: 20,
            textDecoration: "none",
            opacity: 0.8,
            transition: "opacity .15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
        >
          🎢
        </a>
      )}

      {/* Score + stars */}
      <div style={{ textAlign: "right" as const, flexShrink: 0 }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 22, color: "#FFA502" }}>
          {row.total_score}
        </div>
        <div style={{ fontSize: 13, color: "#FFA502", letterSpacing: 1 }}>{stars}</div>
      </div>
    </div>
  );
}

function SeasonToggle({ season, onChange }: { season: string; onChange: (s: string) => void }) {
  const thisMonth = new Date().toISOString().slice(0, 7);
  const options = [
    { value: "global", label: "🌎 Global" },
    { value: thisMonth, label: `📅 ${thisMonth}` },
  ];
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          style={{
            fontFamily: "'Fredoka',system-ui,sans-serif",
            fontWeight: 700, fontSize: 13,
            padding: "6px 16px", borderRadius: 20, cursor: "pointer",
            border: "2px solid",
            borderColor: season === o.value ? "#FF6BD6" : "#4a2aa6",
            background: season === o.value ? "rgba(255,107,214,.2)" : "rgba(0,0,0,.3)",
            color: season === o.value ? "#FF6BD6" : "#B7AEE0",
            transition: "all .15s",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function LeaderboardPage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [season, setSeason] = useState("global");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user.id ?? null);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("leaderboard_with_profiles")
          .select("*")
          .eq("season", season)
          .order("rank", { ascending: true })
          .limit(50);

        if (fetchError) throw fetchError;

        const base = (data ?? []) as LeaderboardRow[];
        if (base.length === 0) { setRows([]); setLoading(false); return; }

        const { data: entries } = await supabase
          .from("leaderboard_entries")
          .select("id, blueprint_id")
          .in("id", base.map((r) => r.id));

        const bpMap: Record<string, string | null> = {};
        for (const e of entries ?? []) bpMap[e.id] = e.blueprint_id ?? null;

        setRows(base.map((r) => ({ ...r, blueprint_id: bpMap[r.id] ?? null })));
        setLoading(false);
      } catch {
        setError("Não foi possível carregar o ranking. Verifique sua conexão.");
        setLoading(false);
      }
    })();
  }, [season, retryCount]);

  const currentUserRank = rows.find((r) => r.user_id === currentUserId);

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.9} }
        @keyframes slideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={S.content}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 32, margin: 0, lineHeight: 1 }}>
              🏆 Ranking Global
            </h1>
            <div style={{ color: "#B7AEE0", fontSize: 14, marginTop: 6 }}>
              Top 50 corridas mais épicas de todos os tempos
            </div>
          </div>
          <SeasonToggle season={season} onChange={setSeason} />
        </div>

        {/* Current user callout (if not in top 50) */}
        {!loading && currentUserRank && currentUserRank.rank > 50 && (
          <div style={{
            ...S.card,
            background: "linear-gradient(90deg,rgba(255,107,214,.15),rgba(112,161,255,.1))",
            border: "2px solid #FF6BD6",
            padding: "12px 20px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ fontSize: 20 }}>📍</span>
            <span style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 15 }}>
              Sua posição: #{currentUserRank.rank} com score {currentUserRank.total_score}
            </span>
          </div>
        )}

        {/* Leaderboard table */}
        <div style={S.card}>
          {error ? (
            <PageError message={error} onRetry={() => setRetryCount((c) => c + 1)} />
          ) : loading ? (
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ height: 62, borderRadius: 14, background: "rgba(255,255,255,.06)", animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.08}s` }} />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#B7AEE0" }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🏁</div>
              <div style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 20 }}>
                Nenhuma corrida ainda!
              </div>
              <div style={{ fontSize: 14, marginTop: 8 }}>
                Seja o primeiro a entrar no ranking.
              </div>
              <a
                href="/play.html"
                style={{ display: "inline-block", marginTop: 20, padding: "10px 24px", background: "linear-gradient(180deg,#FFA502,#c97a00)", borderRadius: 12, color: "#fff", textDecoration: "none", fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700 }}
              >
                Jogar agora
              </a>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
              {rows.map((row) => (
                <div key={row.id} style={{ animation: "slideIn .25s ease both", animationDelay: `${Math.min(row.rank * 0.03, 0.4)}s` }}>
                  <LeaderboardRow
                    row={row}
                    isCurrentUser={row.user_id === currentUserId}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer note */}
        {!loading && rows.length > 0 && (
          <div style={{ textAlign: "center", color: "#B7AEE0", fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}>
            Mostrando top {rows.length} de {season === "global" ? "todos os tempos" : season}
            {" · "}Score = média de Survival, Adrenaline e Chaos
          </div>
        )}
      </div>
    </div>
  );
}
