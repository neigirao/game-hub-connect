import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageError } from "@/components/page-error";

export const Route = createFileRoute("/admin/blueprints")({
  component: AdminBlueprintsPage,
});

type Blueprint = {
  id: string;
  name: string;
  creator_id: string;
  track_data: unknown;
  node_count: number;
  closed_loop: boolean;
  is_public: boolean;
  is_featured: boolean;
  best_total_score: number;
  likes: number;
  downloads: number;
  created_at: string;
  creator_username?: string | null;
};

type TrackNode = { x: number; y: number; kind: string };
type TrackData = { nodes?: TrackNode[]; loop?: boolean };

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
    padding: "6px 14px",
    borderRadius: 8,
    background: color,
    color: "#fff",
    border: "none",
    cursor: "pointer",
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
    width: 280,
  },
};

function MiniTrack({ data }: { data: unknown }) {
  const track = data as TrackData;
  const nodes = track?.nodes ?? [];
  if (nodes.length < 2) return (
    <div style={{ width: 120, height: 50, borderRadius: 6, background: "rgba(0,0,0,.25)", border: "2px dashed rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B7AEE0", fontSize: 10, flexShrink: 0 }}>
      Sem pista
    </div>
  );
  const PAD = 6, W = 120, H = 50;
  const xs = nodes.map((n) => n.x), ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const rX = maxX - minX || 1, rY = maxY - minY || 1;
  const sx = (x: number) => PAD + ((x - minX) / rX) * (W - PAD * 2);
  const sy = (y: number) => PAD + ((y - minY) / rY) * (H - PAD * 2);
  const col = (kind: string) =>
    kind === "booster" ? "#FFA502" : kind === "brake" ? "#FF4757" : kind === "launcher" ? "#2ED573" : kind === "loop" ? "#FF6BD6" : "rgba(255,255,255,0.2)";
  return (
    <svg width={W} height={H} style={{ borderRadius: 6, background: "rgba(0,0,0,.2)", flexShrink: 0 }}>
      <polyline points={nodes.map((n) => `${sx(n.x)},${sy(n.y)}`).join(" ")} fill="none" stroke="#FFE9A8" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {track.loop && nodes.length > 0 && (
        <line x1={sx(nodes[nodes.length - 1].x)} y1={sy(nodes[nodes.length - 1].y)} x2={sx(nodes[0].x)} y2={sy(nodes[0].y)} stroke="#FFE9A8" strokeWidth={1} strokeDasharray="3,2" opacity={0.4} />
      )}
      {nodes.map((n, i) => n.kind !== "normal" ? <circle key={i} cx={sx(n.x)} cy={sy(n.y)} r={2.5} fill={col(n.kind)} /> : null)}
    </svg>
  );
}

export function AdminBlueprintsPage() {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "featured">("all");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  async function fetchBlueprints() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("blueprints")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;
      if (!data) { setLoading(false); return; }

      const userIds = [...new Set(data.map((b) => b.creator_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id,username")
        .in("id", userIds);

      const usernameMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.username]));
      const enriched = data.map((b) => ({ ...b, creator_username: usernameMap[b.creator_id] ?? null }));
      setBlueprints(enriched as Blueprint[]);
      setLoading(false);
    } catch {
      setError("Não foi possível carregar as pistas públicas.");
      setLoading(false);
    }
  }

  useEffect(() => { fetchBlueprints(); }, []);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function toggleFeatured(b: Blueprint) {
    const { error } = await supabase.from("blueprints").update({ is_featured: !b.is_featured }).eq("id", b.id);
    if (error) { showToast(error.message, false); return; }
    showToast(b.is_featured ? "Removido dos destaques" : "Marcado como destaque!");
    setBlueprints((prev) => prev.map((x) => x.id === b.id ? { ...x, is_featured: !x.is_featured } : x));
  }

  async function removeBlueprint(b: Blueprint) {
    if (!window.confirm(`Remover a pista "${b.name}" de ${b.creator_username ?? "Anônimo"}? Ela ficará invisível para outros jogadores.`)) return;
    const { error } = await supabase.from("blueprints").update({ is_public: false }).eq("id", b.id);
    if (error) { showToast(error.message, false); return; }
    showToast("Pista removida do acesso público.");
    setBlueprints((prev) => prev.filter((x) => x.id !== b.id));
  }

  const filtered = blueprints.filter((b) => {
    const matchSearch = search === "" || b.name.toLowerCase().includes(search.toLowerCase()) || (b.creator_username ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || b.is_featured;
    return matchSearch && matchFilter;
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
          <h1 style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 28, margin: 0 }}>🎢 Moderar Pistas</h1>
          <p style={{ color: "#B7AEE0", fontSize: 14, margin: "4px 0 0" }}>
            {filtered.length} pistas públicas {filter === "featured" ? "(destaques)" : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
          <input
            style={S.input}
            placeholder="Buscar por nome ou usuário…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={() => setFilter(filter === "all" ? "featured" : "all")} style={S.btn(filter === "featured" ? "linear-gradient(180deg,#FFA502,#c97a00)" : "rgba(255,255,255,.1)")}>
            {filter === "featured" ? "⭐ Destaques" : "Todos"}
          </button>
        </div>
      </div>

      <div style={S.card}>
        {error ? (
          <PageError message={error} onRetry={fetchBlueprints} />
        ) : loading ? (
          <div style={{ textAlign: "center", padding: 48, color: "#B7AEE0", fontFamily: "'Fredoka',system-ui,sans-serif", fontSize: 18 }}>Carregando pistas…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎢</div>
            <div style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 18 }}>Nenhuma pista encontrada</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((b) => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(0,0,0,.25)", border: `2px solid ${b.is_featured ? "#FFA502" : "#4a2aa6"}`, borderRadius: 14, padding: "12px 14px" }}>
                <MiniTrack data={b.track_data} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: 8 }}>
                    {b.name}
                    {b.is_featured && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 12, background: "rgba(255,165,2,.2)", color: "#FFA502", border: "1px solid rgba(255,165,2,.4)", letterSpacing: ".5px" }}>DESTAQUE</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#B7AEE0", marginTop: 2, display: "flex", gap: 10, flexWrap: "wrap" as const }}>
                    <span>👤 {b.creator_username ?? "Anônimo"}</span>
                    <span>🏆 {b.best_total_score}</span>
                    <span>🔗 {b.node_count} nós</span>
                    <span>❤️ {b.likes}</span>
                    <span>{new Date(b.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button onClick={() => toggleFeatured(b)} style={S.btn(b.is_featured ? "linear-gradient(180deg,#FFA502,#c97a00)" : "rgba(255,165,2,.15)")} title={b.is_featured ? "Remover destaque" : "Marcar como destaque"}>
                    {b.is_featured ? "★ Destaque" : "☆ Destacar"}
                  </button>
                  <button onClick={() => removeBlueprint(b)} style={{ ...S.btn("rgba(255,71,87,.2)"), color: "#FF4757", border: "1px solid rgba(255,71,87,.3)" }}>
                    🗑 Remover
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
