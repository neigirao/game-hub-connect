import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/login" });

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", session.user.id)
      .single();

    if (!profile?.is_admin) throw redirect({ to: "/" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg,#1c0d52 0%,#0b052b 100%)",
      color: "#fff",
      fontFamily: "'Inter',system-ui,sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');`}</style>

      {/* Admin sub-navbar */}
      <div style={{
        background: "rgba(255,71,87,.12)",
        borderBottom: "2px solid rgba(255,71,87,.3)",
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        gap: 20,
      }}>
        <span style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 13, color: "#FF4757", letterSpacing: ".5px" }}>
          🔐 PAINEL ADMIN
        </span>
        <div style={{ width: 1, height: 20, background: "rgba(255,71,87,.3)" }} />
        {[
          { href: "/admin", label: "📊 Dashboard" },
          { href: "/admin/levels", label: "🗺️ Fases" },
          { href: "/admin/blueprints", label: "🎢 Pistas" },
          { href: "/admin/users", label: "👥 Usuários" },
        ].map((l) => (
          <a
            key={l.href}
            href={l.href}
            style={{
              fontFamily: "'Fredoka',system-ui,sans-serif",
              fontWeight: 600, fontSize: 13,
              color: "#B7AEE0", textDecoration: "none",
              padding: "4px 10px", borderRadius: 8,
              transition: "background .15s,color .15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,71,87,.15)"; (e.currentTarget as HTMLElement).style.color = "#FF4757"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#B7AEE0"; }}
          >
            {l.label}
          </a>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
