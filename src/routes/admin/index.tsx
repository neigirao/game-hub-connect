import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

type Stats = {
  totalUsers: number;
  totalRuns: number;
  totalTracks: number;
  topScoreMonth: number;
  recentRuns: Array<{ username: string | null; total_score: number | null; submitted_at: string | null }>;
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

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div style={S.stat}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 32, color: "#fff", lineHeight: 1 }}>
        {value.toLocaleString("pt-BR")}
      </div>
      <div style={{ fontSize: 12, color: "#B7AEE0", letterSpacing: ".5px", textTransform: "uppercase" as const, fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [usersRes, runsRes, tracksRes, topRes, recentRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("leaderboard_entries").select("id", { count: "exact", head: true }),
        supabase.from("blueprints").select("id", { count: "exact", head: true }),
        supabase.from("leaderboard_entries")
          .select("total_score")
          .eq("season", new Date().toISOString().slice(0, 7))
          .order("total_score", { ascending: false })
          .limit(1),
        supabase.from("leaderboard_with_profiles")
          .select("username,total_score,submitted_at")
          .order("submitted_at", { ascending: false })
          .limit(8),
      ]);

      setStats({
        totalUsers: usersRes.count ?? 0,
        totalRuns: runsRes.count ?? 0,
        totalTracks: tracksRes.count ?? 0,
        topScoreMonth: topRes.data?.[0]?.total_score ?? 0,
        recentRuns: recentRes.data ?? [],
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={S.content}>
        <div style={{ ...S.card, textAlign: "center", padding: 48 }}>
          <div style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontSize: 18, color: "#B7AEE0" }}>Carregando métricas…</div>
        </div>
      </div>
    );
  }

  const s = stats!;
  const currentMonth = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div style={S.content}>
      <div>
        <h1 style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 28, margin: 0 }}>
          📊 Dashboard
        </h1>
        <p style={{ color: "#B7AEE0", fontSize: 14, margin: "4px 0 0" }}>
          Visão geral do Crash Coaster em tempo real
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
        <StatCard icon="👥" label="Usuários registrados" value={s.totalUsers} />
        <StatCard icon="🏁" label="Corridas completadas" value={s.totalRuns} />
        <StatCard icon="🎢" label="Pistas salvas" value={s.totalTracks} />
        <StatCard icon="🏆" label={`Top score — ${currentMonth}`} value={s.topScoreMonth} />
      </div>

      {/* Recent runs */}
      <div style={S.card}>
        <div style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 16, color: "#B7AEE0", textTransform: "uppercase" as const, letterSpacing: ".6px", fontSize: 13 }}>
          Últimas corridas
        </div>
        {s.recentRuns.length === 0 ? (
          <div style={{ color: "#B7AEE0", textAlign: "center", padding: 24 }}>Nenhuma corrida ainda</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {s.recentRuns.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(0,0,0,.2)", borderRadius: 10, padding: "10px 14px" }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 13, color: "#FFA502", minWidth: 60 }}>
                  {r.total_score?.toLocaleString("pt-BR") ?? "—"}
                </div>
                <div style={{ flex: 1, fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 600, fontSize: 14 }}>
                  {r.username ?? "Anônimo"}
                </div>
                <div style={{ fontSize: 11, color: "#B7AEE0" }}>
                  {r.submitted_at ? new Date(r.submitted_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {[
          { href: "/admin/levels", icon: "🗺️", label: "Gerenciar Fases", desc: "Criar, editar e publicar fases da campanha" },
          { href: "/admin/blueprints", icon: "🎢", label: "Moderar Pistas", desc: "Remover pistas inadequadas e destacar favoritas" },
          { href: "/admin/users", icon: "👥", label: "Gerenciar Usuários", desc: "Banir jogadores e gerenciar permissões" },
        ].map((l) => (
          <a key={l.href} href={l.href} style={{ ...S.stat, textDecoration: "none", cursor: "pointer", transition: "border-color .15s", border: "2px solid #4a2aa6" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#FF6BD6"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#4a2aa6"; }}
          >
            <div style={{ fontSize: 24 }}>{l.icon}</div>
            <div style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 16, color: "#fff" }}>{l.label}</div>
            <div style={{ fontSize: 12, color: "#B7AEE0" }}>{l.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
