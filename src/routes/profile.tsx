import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

type Profile = Tables<"profiles">;
type Blueprint = Pick<Tables<"blueprints">, "id" | "name" | "node_count" | "best_total_score" | "created_at" | "closed_loop">;
type ScoreEntry = Pick<Tables<"leaderboard_entries">, "id" | "total_score" | "survival_rate" | "adrenaline_score" | "chaos_score" | "max_g_force" | "max_speed_kmh" | "laps_completed" | "submitted_at">;

const XP_PER_LEVEL = 500;

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
    transition: "background .15s,color .15s",
  },
  navLinkActive: {
    background: "rgba(255,107,214,.15)",
    color: "#FF6BD6",
  },
  content: {
    maxWidth: 900,
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
  cardTitle: {
    fontFamily: "'Fredoka',system-ui,sans-serif",
    fontWeight: 700,
    fontSize: 14,
    letterSpacing: ".8px",
    textTransform: "uppercase" as const,
    color: "#B7AEE0",
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  pip: {
    width: 8, height: 8, borderRadius: "50%",
    background: "#FF6BD6",
    boxShadow: "0 0 0 3px rgba(255,107,214,.25)",
    flexShrink: 0,
  },
};

function Avatar({ name, url, size = 72 }: { name: string; url?: string | null; size?: number }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        style={{
          width: size, height: size, borderRadius: "50%",
          border: "3px solid #4a2aa6",
          boxShadow: "0 4px 0 rgba(0,0,0,.3)",
          objectFit: "cover",
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: "linear-gradient(135deg,#FF6BD6,#70A1FF)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Fredoka',system-ui,sans-serif",
        fontWeight: 700, fontSize: size * 0.36, color: "#0E0726",
        border: "3px solid #4a2aa6",
        boxShadow: "0 4px 0 rgba(0,0,0,.3)",
        flexShrink: 0,
      }}
    >
      {initials || "?"}
    </div>
  );
}

function XPBar({ xp, level }: { xp: number; level: number }) {
  const xpInLevel = xp % XP_PER_LEVEL;
  const pct = Math.round((xpInLevel / XP_PER_LEVEL) * 100);
  const xpToNext = XP_PER_LEVEL - xpInLevel;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#B7AEE0", marginBottom: 6, fontFamily: "'JetBrains Mono',monospace" }}>
        <span>{xpInLevel} / {XP_PER_LEVEL} XP</span>
        <span>{xpToNext} para level {level + 1}</span>
      </div>
      <div style={{ height: 10, background: "#1a0a48", borderRadius: 6, border: "2px solid #0a0420", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg,#FF6BD6,#70A1FF)",
            borderRadius: 4,
            transition: "width .6s cubic-bezier(.22,1,.36,1)",
          }}
        />
      </div>
    </div>
  );
}

function StatBadge({ label, value, color = "#FFE9A8" }: { label: string; value: string | number; color?: string }) {
  return (
    <div
      style={{
        background: "rgba(0,0,0,.3)",
        border: "2px solid rgba(255,255,255,.08)",
        borderRadius: 12,
        padding: "10px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        flex: 1,
        minWidth: 100,
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: "1px", textTransform: "uppercase", color: "#B7AEE0", fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 20, color }}>{value}</div>
    </div>
  );
}

function BlueprintRow({ bp }: { bp: Blueprint }) {
  const shareUrl = `${window.location.origin}/play.html?track=${btoa(JSON.stringify({ nodes: [], loop: bp.closed_loop }))}`;
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 12,
        background: "rgba(0,0,0,.25)", border: "2px solid #4a2aa6",
        borderRadius: 14, padding: "12px 14px",
      }}
    >
      <div style={{ fontSize: 22, flexShrink: 0 }}>🎢</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {bp.name}
        </div>
        <div style={{ fontSize: 11, color: "#B7AEE0", fontFamily: "'JetBrains Mono',monospace", marginTop: 2 }}>
          {bp.node_count} nós · {bp.closed_loop ? "loop fechado" : "aberto"} · {new Date(bp.created_at).toLocaleDateString("pt-BR")}
        </div>
      </div>
      {bp.best_total_score > 0 && (
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 12, padding: "4px 8px", borderRadius: 8, background: "rgba(255,165,2,.15)", color: "#FFA502", border: "1px solid rgba(255,165,2,.3)", flexShrink: 0 }}>
          ★ {bp.best_total_score}
        </div>
      )}
      <a
        href={`/play.html`}
        style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 12, padding: "6px 12px", borderRadius: 8, background: "linear-gradient(180deg,#FFA502,#c97a00)", color: "#fff", textDecoration: "none", flexShrink: 0 }}
      >
        Jogar
      </a>
    </div>
  );
}

function ScoreRow({ s }: { s: ScoreEntry }) {
  const total = Math.round(
    (s.survival_rate + s.adrenaline_score + s.chaos_score) / 3
  );
  const stars = total > 75 ? "★★★" : total > 55 ? "★★☆" : total > 25 ? "★☆☆" : "☆☆☆";
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 12,
        background: "rgba(0,0,0,.25)", border: "2px solid #4a2aa6",
        borderRadius: 14, padding: "12px 14px",
      }}
    >
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 22, color: "#FFA502", flexShrink: 0, width: 44 }}>
        {s.total_score}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: "#B7AEE0" }}>
          <span style={{ color: "#2ED573" }}>S:{s.survival_rate}</span>
          <span style={{ color: "#FF4757" }}>A:{s.adrenaline_score}</span>
          <span style={{ color: "#FF7F50" }}>C:{s.chaos_score}</span>
          <span>⚡{s.max_speed_kmh}km/h</span>
          <span>💀{s.max_g_force}G</span>
          {s.laps_completed > 0 && <span>🔄{s.laps_completed}v</span>}
        </div>
        <div style={{ fontSize: 11, color: "#B7AEE0", marginTop: 3 }}>
          {new Date(s.submitted_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
      <div style={{ fontSize: 16, color: "#FFA502", flexShrink: 0 }}>{stars}</div>
    </div>
  );
}

function LoadingCard() {
  return (
    <div style={{ ...S.card, display: "flex", flexDirection: "column", gap: 16 }}>
      {[120, 80, 80, 60].map((w, i) => (
        <div key={i} style={{ height: 18, width: `${w}%`, borderRadius: 8, background: "rgba(255,255,255,.07)", animation: "pulse 1.5s ease-in-out infinite" }} />
      ))}
    </div>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <a
      href={href}
      style={{ ...S.navLink, ...(active ? S.navLinkActive : {}) }}
    >
      {label}
    </a>
  );
}

export function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login";
        return;
      }

      setAvatarUrl(session.user.user_metadata?.avatar_url ?? null);

      const [profileRes, bpRes, scoreRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", session.user.id).single(),
        supabase
          .from("blueprints")
          .select("id, name, node_count, best_total_score, created_at, closed_loop")
          .eq("creator_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("leaderboard_entries")
          .select("id, total_score, survival_rate, adrenaline_score, chaos_score, max_g_force, max_speed_kmh, laps_completed, submitted_at")
          .eq("user_id", session.user.id)
          .order("submitted_at", { ascending: false })
          .limit(5),
      ]);

      setProfile(profileRes.data ?? null);
      setBlueprints((bpRes.data ?? []) as Blueprint[]);
      setScores((scoreRes.data ?? []) as ScoreEntry[]);
      setLoading(false);
    }
    load();
  }, []);

  const displayName = profile?.username ?? profile?.email?.split("@")[0] ?? "Jogador";
  const bestScore = scores.length > 0 ? Math.max(...scores.map((s) => s.total_score)) : 0;

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.9} }
      `}</style>

      {/* Navbar */}
      <nav style={S.navbar}>
        <a href="/home.html" style={S.navLogo}>
          <div style={S.navBadge} />
          <span>CRASH COASTER</span>
        </a>
        <div style={S.navSpacer} />
        <NavLink href="/play.html" label="🎢 Jogar" />
        <NavLink href="/profile" label="👤 Perfil" active />
        <NavLink href="/login" label="Sair" />
      </nav>

      <div style={S.content}>
        {loading ? (
          <>
            <LoadingCard />
            <LoadingCard />
          </>
        ) : profile ? (
          <>
            {/* Hero: avatar + stats */}
            <div style={{ ...S.card, display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" as const }}>
              <Avatar name={displayName} url={avatarUrl} size={88} />

              <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 26, lineHeight: 1.1 }}>
                    {displayName}
                  </div>
                  {profile.email && (
                    <div style={{ fontSize: 13, color: "#B7AEE0", marginTop: 2 }}>{profile.email}</div>
                  )}
                </div>

                {/* Level badge + XP */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 13,
                    background: "linear-gradient(135deg,#FFA502,#FF6BD6)",
                    padding: "4px 12px", borderRadius: 20, color: "#0E0726",
                  }}>
                    LVL {profile.level}
                  </div>
                  <div style={{ flex: 1 }}>
                    <XPBar xp={profile.xp} level={profile.level} />
                  </div>
                </div>
              </div>

              {/* Stat badges */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const, alignSelf: "center" }}>
                <StatBadge label="Coins" value={`🪙 ${profile.coins}`} color="#FFA502" />
                <StatBadge label="XP Total" value={profile.xp} color="#FF6BD6" />
                <StatBadge label="Melhor Score" value={bestScore || "—"} color="#2ED573" />
                <StatBadge label="Pistas" value={blueprints.length} color="#70A1FF" />
              </div>
            </div>

            {/* CTA Jogar */}
            <a
              href="/play.html"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                background: "linear-gradient(180deg,#FFA502,#c97a00)",
                border: "2px solid #FFCB6B",
                borderRadius: 18, padding: "18px 28px",
                fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 20,
                color: "#fff", textDecoration: "none",
                boxShadow: "0 6px 0 #6e3f00, 0 0 0 4px rgba(255,165,2,.18)",
                transition: "transform .1s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              LANÇAR AGORA!
            </a>

            {/* Pistas salvas */}
            <div style={S.card}>
              <div style={S.cardTitle}>
                <div style={S.pip} />
                Últimas Pistas Salvas
              </div>
              {blueprints.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "#B7AEE0", fontFamily: "'Fredoka',system-ui,sans-serif", fontSize: 16 }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🎢</div>
                  Nenhuma pista salva ainda. Construa algo épico!
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {blueprints.map((bp) => (
                    <BlueprintRow key={bp.id} bp={bp} />
                  ))}
                </div>
              )}
            </div>

            {/* Histórico de scores */}
            <div style={S.card}>
              <div style={S.cardTitle}>
                <div style={{ ...S.pip, background: "#FFA502", boxShadow: "0 0 0 3px rgba(255,165,2,.25)" }} />
                Histórico de Corridas
              </div>
              {scores.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "#B7AEE0", fontFamily: "'Fredoka',system-ui,sans-serif", fontSize: 16 }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🏁</div>
                  Nenhuma corrida registrada. Lance uma pista!
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {scores.map((s) => (
                    <ScoreRow key={s.id} s={s} />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ ...S.card, textAlign: "center", padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>😅</div>
            <div style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 20 }}>
              Perfil não encontrado
            </div>
            <div style={{ color: "#B7AEE0", marginTop: 8, fontSize: 14 }}>
              Parece que seu perfil ainda não foi criado. Tente fazer login novamente.
            </div>
            <a href="/login" style={{ display: "inline-block", marginTop: 16, padding: "10px 20px", background: "linear-gradient(180deg,#FF6BD6,#a8329c)", borderRadius: 12, color: "#fff", textDecoration: "none", fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700 }}>
              Ir para Login
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
