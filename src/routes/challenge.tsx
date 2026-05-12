import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageError, PulseSkeleton } from "@/components/page-error";

export const Route = createFileRoute("/challenge")({
  head: () => ({
    meta: [
      { title: "Desafio do Dia — Crash Coaster" },
      { name: "description", content: "Jogue o Desafio do Dia do Crash Coaster. Todos jogam a mesma pista — quem faz o maior score?" },
    ],
  }),
  component: ChallengePage,
});

type DailyPick = {
  date: string;
  blueprint_id: string;
  title: string;
  description: string;
  blueprints: {
    id: string;
    name: string;
    node_count: number;
    best_total_score: number;
    profiles: { username: string } | null;
  } | null;
};

type RankEntry = {
  user_id: string;
  total_score: number;
  max_g_force: number;
  max_speed_kmh: number;
  profiles: { username: string } | null;
};

const S = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#1c0d52 0%,#0b052b 100%)",
    color: "#fff",
    fontFamily: "'Inter',system-ui,sans-serif",
    WebkitFontSmoothing: "antialiased" as const,
  },
  content: {
    maxWidth: 760,
    margin: "0 auto",
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 28,
  },
  card: {
    background: "linear-gradient(180deg,#2e1870,#1a0e50)",
    border: "2px solid #4a2aa6",
    borderRadius: 24,
    overflow: "hidden" as const,
    boxShadow: "0 8px 0 rgba(0,0,0,.35)",
  },
};

function Countdown() {
  const [seconds, setSeconds] = useState(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.floor((midnight.getTime() - now.getTime()) / 1000);
  });

  useEffect(() => {
    const iv = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(iv);
  }, []);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 14, color: "#FFA502" }}>
      <span style={{ fontSize: 12, color: "#B7AEE0", fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 600 }}>Renova em</span>
      {pad(h)}:{pad(m)}:{pad(s)}
    </div>
  );
}

function RankTable({ entries, userId }: { entries: RankEntry[]; userId: string | null }) {
  if (entries.length === 0) {
    return (
      <div style={{ textAlign: "center" as const, padding: "28px 0", color: "#B7AEE0", fontFamily: "'Fredoka',system-ui,sans-serif", fontSize: 15 }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🏁</div>
        Seja o primeiro a jogar o desafio de hoje!
      </div>
    );
  }

  const podiumColors = ["#FFA502", "#C0C0C0", "#CD7F32"];

  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 4 }}>
      {entries.map((e, i) => {
        const isMe = userId === e.user_id;
        return (
          <div
            key={e.user_id + i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              borderRadius: 12,
              background: isMe ? "rgba(255,107,214,.12)" : i % 2 === 0 ? "rgba(255,255,255,.03)" : "transparent",
              border: isMe ? "1px solid rgba(255,107,214,.3)" : "1px solid transparent",
            }}
          >
            <div style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: i < 3 ? `${podiumColors[i]}30` : "rgba(255,255,255,.06)",
              border: `2px solid ${i < 3 ? podiumColors[i] : "rgba(255,255,255,.12)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'JetBrains Mono',monospace",
              fontWeight: 700,
              fontSize: 12,
              color: i < 3 ? podiumColors[i] : "#B7AEE0",
              flexShrink: 0,
            }}>
              {i + 1}
            </div>
            <div style={{ flex: 1, fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 14, color: isMe ? "#FF6BD6" : "#fff" }}>
              {e.profiles?.username ?? "Anônimo"}
              {isMe && <span style={{ marginLeft: 6, fontSize: 10, color: "#FF6BD6", fontWeight: 600 }}>você</span>}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 16, color: i === 0 ? "#FFA502" : "#2ED573" }}>
              {e.total_score}
            </div>
            <div style={{ fontSize: 11, color: "#B7AEE0", textAlign: "right" as const, flexShrink: 0 }}>
              <div>⚡ {e.max_speed_kmh} km/h</div>
              <div>💀 {e.max_g_force.toFixed(1)}G</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ChallengePage() {
  const [pick, setPick] = useState<DailyPick | null>(null);
  const [entries, setEntries] = useState<RankEntry[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const today = new Date().toISOString().slice(0, 10);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user.id ?? null);

      const [pickRes, rankRes] = await Promise.all([
        supabase
          .from("daily_picks")
          .select("date,blueprint_id,title,description,blueprints(id,name,node_count,best_total_score,profiles(username))")
          .eq("date", today)
          .single(),
        supabase
          .from("leaderboard_entries")
          .select("user_id,total_score,max_g_force,max_speed_kmh,profiles!user_id(username)")
          .eq("season", `daily-${today}`)
          .order("total_score", { ascending: false })
          .limit(50),
      ]);

      if (pickRes.error && pickRes.error.code !== "PGRST116") throw pickRes.error;

      setPick((pickRes.data as unknown as DailyPick) ?? null);
      setEntries((rankRes.data ?? []) as unknown as RankEntry[]);
      setLoading(false);
    } catch {
      setError("Não foi possível carregar o desafio do dia.");
      setLoading(false);
    }
  }, [today]);

  useEffect(() => { load(); }, [load, retryCount]);

  const playUrl = pick
    ? `/play.html?blueprint=${pick.blueprint_id}&daily=${today}`
    : null;

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');
        @keyframes slideIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
      `}</style>

      <div style={S.content}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 36, margin: 0, lineHeight: 1 }}>
              🏁 Desafio do Dia
            </h1>
            <p style={{ color: "#B7AEE0", fontSize: 15, marginTop: 8, marginBottom: 0 }}>
              Todos jogam a mesma pista. Quem faz o maior score?
            </p>
          </div>
          <Countdown />
        </div>

        {error ? (
          <PageError message={error} onRetry={() => setRetryCount((c) => c + 1)} />
        ) : loading ? (
          <>
            <PulseSkeleton height={200} borderRadius={24} />
            <PulseSkeleton height={300} borderRadius={24} />
          </>
        ) : !pick ? (
          <div style={{
            ...S.card,
            padding: 48,
            textAlign: "center" as const,
          }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🚧</div>
            <div style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 22, color: "#fff", marginBottom: 8 }}>
              Nenhum desafio hoje (ainda)
            </div>
            <div style={{ fontSize: 14, color: "#B7AEE0", marginBottom: 24 }}>
              O admin escolhe a pista do dia — volte mais tarde ou jogue em modo livre.
            </div>
            <a
              href="/play.html"
              style={{
                fontFamily: "'Fredoka',system-ui,sans-serif",
                fontWeight: 700,
                fontSize: 15,
                padding: "10px 28px",
                borderRadius: 14,
                background: "linear-gradient(180deg,#FFA502,#c97a00)",
                color: "#fff",
                textDecoration: "none",
                display: "inline-block",
                boxShadow: "0 4px 0 rgba(0,0,0,.3)",
              }}
            >
              🎢 Jogar Livre
            </a>
          </div>
        ) : (
          <>
            {/* Challenge card */}
            <div style={{ ...S.card, animation: "slideIn .35s ease both" }}>
              {/* Header band */}
              <div style={{
                background: "linear-gradient(90deg,#FF4757,#FFA502)",
                padding: "10px 24px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}>
                <span style={{ fontSize: 18 }}>📅</span>
                <span style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>
                  {new Date(today + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                </span>
              </div>

              <div style={{ padding: "24px 28px" }}>
                <h2 style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 26, margin: "0 0 8px", color: "#FFA502" }}>
                  {pick.title}
                </h2>
                <p style={{ color: "#B7AEE0", fontSize: 14, margin: "0 0 20px", lineHeight: 1.5 }}>
                  {pick.description}
                </p>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const, marginBottom: 24, alignItems: "center" }}>
                  <div style={{
                    background: "rgba(0,0,0,.3)",
                    border: "1px solid rgba(255,255,255,.1)",
                    borderRadius: 10,
                    padding: "6px 12px",
                    fontSize: 12,
                    color: "#B7AEE0",
                  }}>
                    🎢 <span style={{ color: "#fff", fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700 }}>
                      {pick.blueprints?.name ?? "Pista do Dia"}
                    </span>
                  </div>
                  {pick.blueprints?.profiles && (
                    <div style={{ fontSize: 11, color: "#B7AEE0" }}>
                      por <span style={{ color: "#FF6BD6" }}>{pick.blueprints.profiles.username}</span>
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: "#B7AEE0" }}>
                    {pick.blueprints?.node_count ?? 0} nós
                  </div>
                </div>

                <a
                  href={playUrl!}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    fontFamily: "'Fredoka',system-ui,sans-serif",
                    fontWeight: 700,
                    fontSize: 18,
                    padding: "14px 36px",
                    borderRadius: 16,
                    background: "linear-gradient(180deg,#FFA502,#c97a00)",
                    border: "2px solid #FFCB6B",
                    color: "#fff",
                    textDecoration: "none",
                    boxShadow: "0 6px 0 #6e3f00",
                  }}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  Aceitar Desafio!
                </a>
              </div>
            </div>

            {/* Leaderboard */}
            <div style={{ ...S.card, animation: "slideIn .35s ease .1s both" }}>
              <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 18, color: "#fff" }}>
                  🏆 Ranking de Hoje
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#2ED573" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2ED573", display: "inline-block", animation: "pulse 1.5s ease infinite" }} />
                  AO VIVO
                </div>
              </div>
              <div style={{ padding: "14px 20px 20px" }}>
                {!userId ? (
                  <div style={{ textAlign: "center" as const, padding: "20px 0", color: "#B7AEE0", fontSize: 13 }}>
                    <a href="/login" style={{ color: "#FF6BD6", fontWeight: 700, textDecoration: "none" }}>Faça login</a> para aparecer no ranking.
                  </div>
                ) : null}
                <RankTable entries={entries} userId={userId} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
