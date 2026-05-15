import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageError, PulseSkeleton } from "@/components/page-error";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

type Stats = {
  totalUsers: number;
  totalRuns: number;
  totalTracks: number;
  topScoreMonth: number;
  todayRuns: number;
  weekUsers: number;
  newBlueprintsToday: number;
  recentRuns: Array<{
    username: string | null;
    total_score: number | null;
    submitted_at: string | null;
  }>;
};

const S = {
  content: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "28px 24px",
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
  stat: {
    background: "rgba(0,0,0,.25)",
    border: "2px solid #4a2aa6",
    borderRadius: 16,
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 4,
  },
};

function StatCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: number | string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        ...S.stat,
        border: highlight ? "2px solid rgba(255,107,214,.5)" : "2px solid #4a2aa6",
        background: highlight
          ? "linear-gradient(180deg,rgba(255,107,214,.08),rgba(0,0,0,.25))"
          : "rgba(0,0,0,.25)",
      }}
    >
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div
        style={{
          fontFamily: "'Fredoka',system-ui,sans-serif",
          fontWeight: 700,
          fontSize: 32,
          color: highlight ? "#FF6BD6" : "#fff",
          lineHeight: 1,
        }}
      >
        {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "#B7AEE0",
          letterSpacing: ".5px",
          textTransform: "uppercase" as const,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const load = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIso = today.toISOString();
      const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
      const thisMonth = new Date().toISOString().slice(0, 7);

      const [
        usersRes,
        runsRes,
        tracksRes,
        topRes,
        recentRes,
        todayRunsRes,
        weekUsersRes,
        newBpRes,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("leaderboard_entries").select("id", { count: "exact", head: true }),
        supabase.from("blueprints").select("id", { count: "exact", head: true }),
        supabase
          .from("leaderboard_entries")
          .select("total_score")
          .eq("season", thisMonth)
          .order("total_score", { ascending: false })
          .limit(1),
        supabase
          .from("leaderboard_with_profiles")
          .select("username,total_score,submitted_at")
          .order("submitted_at", { ascending: false })
          .limit(8),
        supabase
          .from("leaderboard_entries")
          .select("id", { count: "exact", head: true })
          .gte("submitted_at", todayIso),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gte("created_at", weekAgo),
        supabase
          .from("blueprints")
          .select("id", { count: "exact", head: true })
          .gte("created_at", todayIso),
      ]);

      setStats({
        totalUsers: usersRes.count ?? 0,
        totalRuns: runsRes.count ?? 0,
        totalTracks: tracksRes.count ?? 0,
        topScoreMonth: topRes.data?.[0]?.total_score ?? 0,
        todayRuns: todayRunsRes.count ?? 0,
        weekUsers: weekUsersRes.count ?? 0,
        newBlueprintsToday: newBpRes.count ?? 0,
        recentRuns: recentRes.data ?? [],
      });
      if (!silent) setLoading(false);
    } catch {
      if (!silent) {
        setError("Não foi possível carregar as métricas do dashboard.");
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [retryCount, load]);

  useEffect(() => {
    const channel = supabase
      .channel("admin_dash_rt")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "leaderboard_entries" },
        () => {
          load(true);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  if (error) {
    return (
      <div style={S.content}>
        <PageError message={error} onRetry={() => setRetryCount((c) => c + 1)} />
      </div>
    );
  }

  if (loading) {
    return (
      <div style={S.content}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
            gap: 16,
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <PulseSkeleton key={i} height={90} borderRadius={16} delay={i * 0.08} />
          ))}
        </div>
        <div style={S.card}>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <PulseSkeleton key={i} height={44} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const s = stats!;
  const currentMonth = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div style={S.content}>
      <div>
        <h1
          style={{
            fontFamily: "'Fredoka',system-ui,sans-serif",
            fontWeight: 700,
            fontSize: 28,
            margin: 0,
          }}
        >
          📊 Dashboard
        </h1>
        <p style={{ color: "#B7AEE0", fontSize: 14, margin: "4px 0 0" }}>
          Visão geral do Crash Coaster — atualiza em tempo real
        </p>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
          gap: 16,
        }}
      >
        <StatCard icon="👥" label="Usuários registrados" value={s.totalUsers} />
        <StatCard
          icon="🆕"
          label="Novos esta semana"
          value={s.weekUsers}
          highlight={s.weekUsers > 0}
        />
        <StatCard icon="🏁" label="Corridas totais" value={s.totalRuns} />
        <StatCard icon="⚡" label="Corridas hoje" value={s.todayRuns} highlight={s.todayRuns > 0} />
        <StatCard icon="🎢" label="Pistas salvas" value={s.totalTracks} />
        <StatCard icon="🏆" label={`Top score — ${currentMonth}`} value={s.topScoreMonth} />
      </div>

      {/* Recent runs */}
      <div style={S.card}>
        <div
          style={{
            fontFamily: "'Fredoka',system-ui,sans-serif",
            fontWeight: 700,
            fontSize: 13,
            marginBottom: 16,
            color: "#B7AEE0",
            textTransform: "uppercase" as const,
            letterSpacing: ".6px",
          }}
        >
          Últimas corridas
        </div>
        {s.recentRuns.length === 0 ? (
          <div style={{ color: "#B7AEE0", textAlign: "center", padding: 24 }}>
            Nenhuma corrida ainda
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {s.recentRuns.map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "rgba(0,0,0,.2)",
                  borderRadius: 10,
                  padding: "10px 14px",
                }}
              >
                <div
                  style={{
                    fontFamily: "'JetBrains Mono',monospace",
                    fontWeight: 700,
                    fontSize: 13,
                    color: "#FFA502",
                    minWidth: 60,
                  }}
                >
                  {r.total_score?.toLocaleString("pt-BR") ?? "—"}
                </div>
                <div
                  style={{
                    flex: 1,
                    fontFamily: "'Fredoka',system-ui,sans-serif",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  {r.username ?? "Anônimo"}
                </div>
                <div style={{ fontSize: 11, color: "#B7AEE0" }}>
                  {r.submitted_at
                    ? new Date(r.submitted_at).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {[
          {
            href: "/admin/levels",
            icon: "🗺️",
            label: "Gerenciar Fases",
            desc: "Criar, editar e publicar fases da campanha",
            badge: null,
          },
          {
            href: "/admin/blueprints",
            icon: "🎢",
            label: "Moderar Pistas",
            desc: "Remover pistas inadequadas e destacar favoritas",
            badge: s.newBlueprintsToday > 0 ? `+${s.newBlueprintsToday} hoje` : null,
          },
          {
            href: "/admin/users",
            icon: "👥",
            label: "Gerenciar Usuários",
            desc: "Banir jogadores e gerenciar permissões",
            badge: null,
          },
        ].map((l) => (
          <a
            key={l.href}
            href={l.href}
            style={{
              ...S.stat,
              textDecoration: "none",
              cursor: "pointer",
              transition: "border-color .15s",
              border: "2px solid #4a2aa6",
              position: "relative" as const,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#FF6BD6";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#4a2aa6";
            }}
          >
            {l.badge && (
              <span
                style={{
                  position: "absolute",
                  top: 10,
                  right: 12,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 20,
                  background: "rgba(255,107,214,.2)",
                  color: "#FF6BD6",
                  border: "1px solid rgba(255,107,214,.4)",
                  letterSpacing: ".5px",
                }}
              >
                {l.badge}
              </span>
            )}
            <div style={{ fontSize: 24 }}>{l.icon}</div>
            <div
              style={{
                fontFamily: "'Fredoka',system-ui,sans-serif",
                fontWeight: 700,
                fontSize: 16,
                color: "#fff",
              }}
            >
              {l.label}
            </div>
            <div style={{ fontSize: 12, color: "#B7AEE0" }}>{l.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
