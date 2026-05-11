import { createFileRoute } from "@tanstack/react-router";
import { PageError } from "@/components/page-error";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

type Profile = {
  id: string;
  email: string;
  username: string;
  level: number;
  xp: number;
  coins: number;
  is_admin: boolean;
  is_banned: boolean;
  avatar_url: string | null;
  created_at: string;
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
  btn: (color: string) => ({
    fontFamily: "'Fredoka',system-ui,sans-serif",
    fontWeight: 700,
    fontSize: 12,
    padding: "6px 12px",
    borderRadius: 8,
    background: color,
    color: "#fff",
    border: "none",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  }),
  input: {
    padding: "9px 14px",
    background: "rgba(0,0,0,.3)",
    border: "2px solid rgba(255,255,255,.12)",
    borderRadius: 10,
    color: "#fff",
    fontFamily: "'Inter',system-ui,sans-serif",
    fontSize: 14,
    outline: "none",
    width: 300,
  },
  badge: (color: string, bg: string) => ({
    fontSize: 10,
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: 12,
    background: bg,
    color,
    border: `1px solid ${color}40`,
    letterSpacing: ".5px",
    whiteSpace: "nowrap" as const,
  }),
};

export function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (fetchError) throw fetchError;
      setUsers((data ?? []) as Profile[]);
      setLoading(false);
    } catch {
      setError("Não foi possível carregar os usuários.");
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function toggleBan(u: Profile) {
    if (!u.is_banned && !window.confirm(`Banir ${u.username}? O usuário não conseguirá mais acessar o jogo.`)) return;
    const { error } = await supabase.from("profiles").update({ is_banned: !u.is_banned }).eq("id", u.id);
    if (error) { showToast(error.message, false); return; }
    showToast(u.is_banned ? `${u.username} desbanido.` : `${u.username} banido.`);
    setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, is_banned: !x.is_banned } : x));
  }

  async function toggleAdmin(u: Profile) {
    const action = u.is_admin ? "revogar admin de" : "tornar admin";
    if (!window.confirm(`Deseja ${action} ${u.username}?`)) return;
    const { error } = await supabase.from("profiles").update({ is_admin: !u.is_admin }).eq("id", u.id);
    if (error) { showToast(error.message, false); return; }
    showToast(u.is_admin ? `Admin revogado de ${u.username}.` : `${u.username} agora é admin.`);
    setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, is_admin: !x.is_admin } : x));
  }

  const filtered = users.filter((u) => {
    if (search === "") return true;
    const q = search.toLowerCase();
    return u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div style={S.content}>
      {toast && (
        <div style={{ position: "fixed", top: 80, right: 24, zIndex: 999, background: toast.ok ? "linear-gradient(135deg,#2ED573,#1a8a46)" : "linear-gradient(135deg,#FF4757,#a02030)", border: `2px solid ${toast.ok ? "#2ED573" : "#FF4757"}`, borderRadius: 14, padding: "12px 20px", fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 15, color: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,.4)", animation: "slideIn .2s ease both" }}>
          {toast.ok ? "✓" : "✕"} {toast.msg}
        </div>
      )}
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}`}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 28, margin: 0 }}>👥 Usuários</h1>
          <p style={{ color: "#B7AEE0", fontSize: 14, margin: "4px 0 0" }}>
            {filtered.length} de {users.length} usuários
          </p>
        </div>
        <input
          style={S.input}
          placeholder="Buscar por username ou email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={S.card}>
        {error ? (
          <PageError message={error} onRetry={fetchUsers} />
        ) : loading ? (
          <div style={{ textAlign: "center", padding: 48, color: "#B7AEE0", fontFamily: "'Fredoka',system-ui,sans-serif", fontSize: 18 }}>Carregando usuários…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 48 }}>
            <div style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 18 }}>Nenhum usuário encontrado</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((u) => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 14, background: u.is_banned ? "rgba(255,71,87,.07)" : "rgba(0,0,0,.25)", border: `2px solid ${u.is_banned ? "rgba(255,71,87,.3)" : u.is_admin ? "rgba(255,165,2,.3)" : "#4a2aa6"}`, borderRadius: 14, padding: "12px 14px" }}>
                {/* Avatar */}
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt={u.username} style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #4a2aa6", flexShrink: 0, objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#FF6BD6,#70A1FF)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 14, color: "#0E0726", flexShrink: 0 }}>
                    {u.username[0]?.toUpperCase() ?? "?"}
                  </div>
                )}

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
                    <span style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 15 }}>{u.username}</span>
                    {u.is_admin && <span style={S.badge("#FFA502", "rgba(255,165,2,.15)")}>ADMIN</span>}
                    {u.is_banned && <span style={S.badge("#FF4757", "rgba(255,71,87,.15)")}>BANIDO</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#B7AEE0", marginTop: 2, display: "flex", gap: 10, flexWrap: "wrap" as const }}>
                    <span>{u.email}</span>
                    <span>Lv.{u.level}</span>
                    <span>✨ {u.xp} XP</span>
                    <span>🪙 {u.coins}</span>
                    <span>Desde {new Date(u.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => toggleAdmin(u)}
                    style={S.btn(u.is_admin ? "rgba(255,165,2,.2)" : "rgba(255,255,255,.1)")}
                    title={u.is_admin ? "Revogar admin" : "Tornar admin"}
                  >
                    {u.is_admin ? "🔐 Revogar" : "🔐 Admin"}
                  </button>
                  <button
                    onClick={() => toggleBan(u)}
                    style={S.btn(u.is_banned ? "linear-gradient(180deg,#2ED573,#1a8a46)" : "rgba(255,71,87,.2)")}
                    title={u.is_banned ? "Desbanir" : "Banir"}
                  >
                    {u.is_banned ? "✓ Desbanir" : "🚫 Banir"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
