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

type RunRow = { total_score: number | null; submitted_at: string | null; season: string | null };
type BpRow = { id: string; name: string; created_at: string };

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

function UserExpanded({
  user,
  onSave,
}: {
  user: Profile;
  onSave: (xp: number, coins: number) => void;
}) {
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [blueprints, setBlueprints] = useState<BpRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editXp, setEditXp] = useState(user.xp);
  const [editCoins, setEditCoins] = useState(user.coins);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [runsRes, bpRes] = await Promise.all([
        supabase
          .from("leaderboard_entries")
          .select("total_score,submitted_at,season")
          .eq("user_id", user.id)
          .order("submitted_at", { ascending: false })
          .limit(5),
        supabase
          .from("blueprints")
          .select("id,name,created_at")
          .eq("creator_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3),
      ]);
      setRuns(runsRes.data ?? []);
      setBlueprints(bpRes.data ?? []);
      setLoadingData(false);
    })();
  }, [user.id]);

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ xp: editXp, coins: editCoins })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      setSaveMsg("Erro: " + error.message);
      return;
    }
    setSaveMsg("Salvo!");
    setTimeout(() => setSaveMsg(null), 2000);
    onSave(editXp, editCoins);
  }

  const panelInput = {
    padding: "6px 10px",
    background: "rgba(0,0,0,.3)",
    border: "2px solid rgba(255,255,255,.12)",
    borderRadius: 8,
    color: "#fff",
    fontFamily: "'JetBrains Mono',monospace",
    fontSize: 13,
    outline: "none",
    width: 90,
  };

  return (
    <div
      style={{
        background: "rgba(0,0,0,.2)",
        borderTop: "1px solid rgba(255,255,255,.08)",
        padding: "16px 14px 14px",
        display: "flex",
        gap: 24,
        flexWrap: "wrap" as const,
      }}
    >
      {/* Recent runs */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".8px",
            color: "#B7AEE0",
            textTransform: "uppercase" as const,
            marginBottom: 8,
          }}
        >
          Últimas corridas
        </div>
        {loadingData ? (
          <div style={{ color: "#B7AEE0", fontSize: 12 }}>Carregando…</div>
        ) : runs.length === 0 ? (
          <div style={{ color: "#B7AEE0", fontSize: 12 }}>Nenhuma corrida ainda</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {runs.map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 10,
                  fontSize: 12,
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                <span style={{ color: "#FFA502", minWidth: 40 }}>{r.total_score ?? "—"}</span>
                <span style={{ color: "#B7AEE0" }}>{r.season ?? ""}</span>
                <span style={{ color: "#6b5fa0" }}>
                  {r.submitted_at ? new Date(r.submitted_at).toLocaleDateString("pt-BR") : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Blueprints */}
      <div style={{ flex: 1, minWidth: 180 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".8px",
            color: "#B7AEE0",
            textTransform: "uppercase" as const,
            marginBottom: 8,
          }}
        >
          Pistas salvas
        </div>
        {loadingData ? (
          <div style={{ color: "#B7AEE0", fontSize: 12 }}>Carregando…</div>
        ) : blueprints.length === 0 ? (
          <div style={{ color: "#B7AEE0", fontSize: 12 }}>Nenhuma pista salva</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {blueprints.map((b) => (
              <div
                key={b.id}
                style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}
              >
                <a
                  href={`/play.html?blueprint=${b.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#70A1FF",
                    textDecoration: "none",
                    fontFamily: "'Fredoka',system-ui,sans-serif",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  ▶ {b.name}
                </a>
                <span
                  style={{
                    color: "#6b5fa0",
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 11,
                  }}
                >
                  {new Date(b.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit XP / Coins */}
      <div style={{ minWidth: 220 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".8px",
            color: "#B7AEE0",
            textTransform: "uppercase" as const,
            marginBottom: 8,
          }}
        >
          Editar XP / Coins
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" as const }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={{ fontSize: 10, color: "#B7AEE0", letterSpacing: ".5px" }}>✨ XP</label>
            <input
              type="number"
              style={panelInput}
              value={editXp}
              onChange={(e) => setEditXp(Number(e.target.value))}
              min={0}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={{ fontSize: 10, color: "#B7AEE0", letterSpacing: ".5px" }}>
              🪙 Coins
            </label>
            <input
              type="number"
              style={panelInput}
              value={editCoins}
              onChange={(e) => setEditCoins(Number(e.target.value))}
              min={0}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, paddingTop: 14 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                ...S.btn("linear-gradient(180deg,#2ED573,#1a8a46)"),
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? "…" : "Salvar"}
            </button>
            {saveMsg && (
              <span
                style={{
                  fontSize: 11,
                  color: saveMsg.startsWith("Erro") ? "#FF4757" : "#2ED573",
                  marginTop: 2,
                }}
              >
                {saveMsg}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "admins" | "banned">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
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

  useEffect(() => {
    fetchUsers();
  }, []);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function toggleBan(u: Profile) {
    if (
      !u.is_banned &&
      !window.confirm(`Banir ${u.username}? O usuário não conseguirá mais acessar o jogo.`)
    )
      return;
    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: !u.is_banned })
      .eq("id", u.id);
    if (error) {
      showToast(error.message, false);
      return;
    }
    showToast(u.is_banned ? `${u.username} desbanido.` : `${u.username} banido.`);
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_banned: !x.is_banned } : x)));
  }

  async function toggleAdmin(u: Profile) {
    const action = u.is_admin ? "revogar admin de" : "tornar admin";
    if (!window.confirm(`Deseja ${action} ${u.username}?`)) return;
    const { error } = await supabase
      .from("profiles")
      .update({ is_admin: !u.is_admin })
      .eq("id", u.id);
    if (error) {
      showToast(error.message, false);
      return;
    }
    showToast(u.is_admin ? `Admin revogado de ${u.username}.` : `${u.username} agora é admin.`);
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_admin: !x.is_admin } : x)));
  }

  const FILTER_OPTS = [
    { key: "all", label: "Todos" },
    { key: "admins", label: "Admins" },
    { key: "banned", label: "Banidos" },
  ] as const;

  const filtered = users.filter((u) => {
    if (search !== "") {
      const q = search.toLowerCase();
      if (!u.username.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    }
    if (filterMode === "admins" && !u.is_admin) return false;
    if (filterMode === "banned" && !u.is_banned) return false;
    return true;
  });

  return (
    <div style={S.content}>
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 80,
            right: 24,
            zIndex: 999,
            background: toast.ok
              ? "linear-gradient(135deg,#2ED573,#1a8a46)"
              : "linear-gradient(135deg,#FF4757,#a02030)",
            border: `2px solid ${toast.ok ? "#2ED573" : "#FF4757"}`,
            borderRadius: 14,
            padding: "12px 20px",
            fontFamily: "'Fredoka',system-ui,sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: "#fff",
            boxShadow: "0 4px 20px rgba(0,0,0,.4)",
            animation: "slideIn .2s ease both",
          }}
        >
          {toast.ok ? "✓" : "✕"} {toast.msg}
        </div>
      )}
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}`}</style>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap" as const,
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Fredoka',system-ui,sans-serif",
              fontWeight: 700,
              fontSize: 28,
              margin: 0,
            }}
          >
            👥 Usuários
          </h1>
          <p style={{ color: "#B7AEE0", fontSize: 14, margin: "4px 0 0" }}>
            {filtered.length} de {users.length} usuários
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" as const }}>
          {/* Filter tabs */}
          <div
            style={{
              display: "flex",
              background: "rgba(0,0,0,.3)",
              borderRadius: 10,
              padding: 3,
              gap: 2,
            }}
          >
            {FILTER_OPTS.map((o) => (
              <button
                key={o.key}
                onClick={() => setFilterMode(o.key)}
                style={{
                  ...S.btn(
                    filterMode === o.key
                      ? "linear-gradient(180deg,#FF6BD6,#a8329c)"
                      : "transparent",
                  ),
                  padding: "5px 14px",
                  fontSize: 13,
                  border: "none",
                  color: filterMode === o.key ? "#fff" : "#B7AEE0",
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
          <input
            style={S.input}
            placeholder="Buscar por username ou email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={S.card}>
        {error ? (
          <PageError message={error} onRetry={fetchUsers} />
        ) : loading ? (
          <div
            style={{
              textAlign: "center",
              padding: 48,
              color: "#B7AEE0",
              fontFamily: "'Fredoka',system-ui,sans-serif",
              fontSize: 18,
            }}
          >
            Carregando usuários…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 48 }}>
            <div
              style={{
                fontFamily: "'Fredoka',system-ui,sans-serif",
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              Nenhum usuário encontrado
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((u) => (
              <div
                key={u.id}
                style={{
                  background: u.is_banned ? "rgba(255,71,87,.07)" : "rgba(0,0,0,.25)",
                  border: `2px solid ${u.is_banned ? "rgba(255,71,87,.3)" : u.is_admin ? "rgba(255,165,2,.3)" : "#4a2aa6"}`,
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                {/* User row */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px" }}
                >
                  {/* Avatar */}
                  {u.avatar_url ? (
                    <img
                      src={u.avatar_url}
                      alt={u.username}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        border: "2px solid #4a2aa6",
                        flexShrink: 0,
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg,#FF6BD6,#70A1FF)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "'Fredoka',system-ui,sans-serif",
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#0E0726",
                        flexShrink: 0,
                      }}
                    >
                      {u.username[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap" as const,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Fredoka',system-ui,sans-serif",
                          fontWeight: 700,
                          fontSize: 15,
                        }}
                      >
                        {u.username}
                      </span>
                      {u.is_admin && (
                        <span style={S.badge("#FFA502", "rgba(255,165,2,.15)")}>ADMIN</span>
                      )}
                      {u.is_banned && (
                        <span style={S.badge("#FF4757", "rgba(255,71,87,.15)")}>BANIDO</span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#B7AEE0",
                        marginTop: 2,
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap" as const,
                      }}
                    >
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
                      onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}
                      style={S.btn(
                        expandedId === u.id
                          ? "linear-gradient(180deg,#FF6BD6,#a8329c)"
                          : "rgba(255,255,255,.1)",
                      )}
                    >
                      {expandedId === u.id ? "▲ Fechar" : "▼ Detalhes"}
                    </button>
                    <button
                      onClick={() => toggleAdmin(u)}
                      style={S.btn(u.is_admin ? "rgba(255,165,2,.2)" : "rgba(255,255,255,.1)")}
                      title={u.is_admin ? "Revogar admin" : "Tornar admin"}
                    >
                      {u.is_admin ? "🔐 Revogar" : "🔐 Admin"}
                    </button>
                    <button
                      onClick={() => toggleBan(u)}
                      style={S.btn(
                        u.is_banned
                          ? "linear-gradient(180deg,#2ED573,#1a8a46)"
                          : "rgba(255,71,87,.2)",
                      )}
                      title={u.is_banned ? "Desbanir" : "Banir"}
                    >
                      {u.is_banned ? "✓ Desbanir" : "🚫 Banir"}
                    </button>
                  </div>
                </div>

                {/* Expanded panel */}
                {expandedId === u.id && (
                  <UserExpanded
                    user={u}
                    onSave={(xp, coins) => {
                      setUsers((prev) =>
                        prev.map((x) => (x.id === u.id ? { ...x, xp, coins } : x)),
                      );
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
