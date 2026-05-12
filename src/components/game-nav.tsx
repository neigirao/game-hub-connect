import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/use-is-admin";

const S = {
  navbar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 20px",
    height: 60,
    background: "linear-gradient(180deg,#3a1f8a,#2a1565)",
    borderBottom: "2px solid #4a2aa6",
    boxShadow: "0 4px 0 rgba(0,0,0,.3)",
    position: "sticky" as const,
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontFamily: "'Fredoka',system-ui,sans-serif",
    fontWeight: 700,
    fontSize: 17,
    letterSpacing: ".5px",
    textDecoration: "none",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: 9,
    flexShrink: 0,
  },
  badge: {
    width: 30, height: 30, borderRadius: 8,
    background: "conic-gradient(from 220deg,#FFA502,#FF6BD6,#70A1FF,#2ED573,#FFA502)",
    boxShadow: "0 2px 0 #1a0a48",
    flexShrink: 0,
  },
  spacer: { flex: 1 },
  link: {
    fontFamily: "'Fredoka',system-ui,sans-serif",
    fontWeight: 600,
    fontSize: 13,
    color: "#B7AEE0",
    textDecoration: "none",
    padding: "5px 11px",
    borderRadius: 10,
    whiteSpace: "nowrap" as const,
    transition: "background .15s,color .15s",
  },
  linkActive: {
    background: "rgba(255,107,214,.18)",
    color: "#FF6BD6",
  },
  avatar: (url: string) => ({
    width: 28, height: 28, borderRadius: "50%",
    border: "2px solid #4a2aa6",
    objectFit: "cover" as const,
    flexShrink: 0,
  }),
  avatarInitial: {
    width: 28, height: 28, borderRadius: "50%",
    background: "linear-gradient(135deg,#FF6BD6,#70A1FF)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Fredoka',system-ui,sans-serif",
    fontWeight: 700, fontSize: 12, color: "#0E0726",
    border: "2px solid #4a2aa6",
    flexShrink: 0,
  },
  loginBtn: {
    fontFamily: "'Fredoka',system-ui,sans-serif",
    fontWeight: 700, fontSize: 12,
    padding: "5px 14px", borderRadius: 10,
    background: "linear-gradient(180deg,#FF6BD6,#a8329c)",
    color: "#fff", textDecoration: "none",
    border: "none", cursor: "pointer",
    flexShrink: 0,
  },
};

type NavUser = { name: string; avatar: string | null };

const BASE_LINKS = [
  { href: "/play.html", label: "🎢 Jogar" },
  { href: "/campaign", label: "🗺️ Campanha" },
  { href: "/tracks", label: "🛤️ Pistas" },
  { href: "/leaderboard", label: "🏆 Ranking" },
  { href: "/shop", label: "🛒 Loja" },
  { href: "/profile", label: "👤 Perfil" },
];

// Routes where the navbar should not appear
const HIDDEN_PATHS = new Set(["/", "/login"]);

export function GameNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [user, setUser] = useState<NavUser | null>(null);
  const { isAdmin } = useIsAdmin();

  const LINKS = isAdmin
    ? [...BASE_LINKS, { href: "/admin/levels", label: "🔐 Admin" }]
    : BASE_LINKS;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.full_name ?? session.user.email ?? "Jogador",
          avatar: session.user.user_metadata?.avatar_url ?? null,
        });
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.full_name ?? session.user.email ?? "Jogador",
          avatar: session.user.user_metadata?.avatar_url ?? null,
        });
      } else {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (HIDDEN_PATHS.has(pathname)) return null;

  const initial = user?.name?.[0]?.toUpperCase() ?? "?";

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap');`}</style>
      <nav style={S.navbar}>
        <a href="/home.html" style={S.logo}>
          <div style={S.badge} />
          <span>CRASH COASTER</span>
        </a>
        <div style={S.spacer} />
        {LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            style={{
              ...S.link,
              ...(pathname === l.href || (l.href !== "/play.html" && pathname.startsWith(l.href)) ? S.linkActive : {}),
            }}
          >
            {l.label}
          </a>
        ))}
        <div style={{ width: 1, height: 24, background: "rgba(255,255,255,.12)", flexShrink: 0 }} />
        {user ? (
          <a href="/profile" style={{ display: "flex", alignItems: "center", gap: 7, textDecoration: "none" }}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} style={S.avatar(user.avatar)} />
            ) : (
              <div style={S.avatarInitial}>{initial}</div>
            )}
            <span style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 600, fontSize: 13, color: "#fff", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.name.split(" ")[0]}
            </span>
          </a>
        ) : (
          <a href="/login" style={S.loginBtn}>Entrar</a>
        )}
      </nav>
    </>
  );
}
