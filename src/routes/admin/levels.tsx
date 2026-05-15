import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/levels")({
  component: AdminLevelsPage,
});

type Level = Tables<"levels">;
type Objective = { type: string; label: string };
type StarterTrack = { nodes: Array<{ x: number; y: number; kind: string }>; loop: boolean };

const SCENARIOS = ["parque", "montanha", "vulcao", "praia", "espaco"];
const SCENARIO_LABEL: Record<string, string> = {
  parque: "🎡 Parque",
  montanha: "⛰️ Montanha",
  vulcao: "🌋 Vulcão",
  praia: "🏖️ Praia",
  espaco: "🚀 Espaço",
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
  label: {
    display: "block",
    fontSize: 11,
    letterSpacing: "1px",
    textTransform: "uppercase" as const,
    color: "#B7AEE0",
    fontWeight: 600,
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    background: "rgba(0,0,0,.3)",
    border: "2px solid rgba(255,255,255,.12)",
    borderRadius: 10,
    color: "#fff",
    fontFamily: "'Inter',system-ui,sans-serif",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box" as const,
  },
  select: {
    padding: "10px 14px",
    background: "#1a0e50",
    border: "2px solid rgba(255,255,255,.12)",
    borderRadius: 10,
    color: "#fff",
    fontFamily: "'Inter',system-ui,sans-serif",
    fontSize: 14,
    outline: "none",
  },
  btn: (color: string) => ({
    fontFamily: "'Fredoka',system-ui,sans-serif",
    fontWeight: 700,
    fontSize: 13,
    padding: "8px 18px",
    borderRadius: 10,
    background: color,
    color: "#fff",
    border: "none",
    cursor: "pointer",
    transition: "opacity .15s",
  }),
};

function MiniTrack({
  nodes,
  loop,
}: {
  nodes: Array<{ x: number; y: number; kind: string }>;
  loop: boolean;
}) {
  if (!nodes || nodes.length < 2)
    return (
      <div
        style={{
          width: 160,
          height: 60,
          borderRadius: 8,
          background: "rgba(0,0,0,.25)",
          border: "2px dashed rgba(255,255,255,.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#B7AEE0",
          fontSize: 11,
        }}
      >
        Sem pista
      </div>
    );

  const PAD = 8,
    W = 160,
    H = 60;
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs);
  const minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const rX = maxX - minX || 1,
    rY = maxY - minY || 1;
  const sx = (x: number) => PAD + ((x - minX) / rX) * (W - PAD * 2);
  const sy = (y: number) => PAD + ((y - minY) / rY) * (H - PAD * 2);
  const col = (kind: string) =>
    kind === "booster"
      ? "#FFA502"
      : kind === "brake"
        ? "#FF4757"
        : kind === "launcher"
          ? "#2ED573"
          : kind === "loop"
            ? "#FF6BD6"
            : "rgba(255,255,255,0.3)";

  return (
    <svg width={W} height={H} style={{ borderRadius: 8, background: "rgba(0,0,0,.2)" }}>
      <polyline
        points={nodes.map((n) => `${sx(n.x)},${sy(n.y)}`).join(" ")}
        fill="none"
        stroke="#FFE9A8"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {loop && nodes.length > 0 && (
        <line
          x1={sx(nodes[nodes.length - 1].x)}
          y1={sy(nodes[nodes.length - 1].y)}
          x2={sx(nodes[0].x)}
          y2={sy(nodes[0].y)}
          stroke="#FFE9A8"
          strokeWidth={1.5}
          strokeDasharray="4,3"
          opacity={0.5}
        />
      )}
      {nodes.map((n, i) =>
        n.kind !== "normal" ? (
          <circle
            key={i}
            cx={sx(n.x)}
            cy={sy(n.y)}
            r={3}
            fill={col(n.kind)}
            stroke="#0E0726"
            strokeWidth={1}
          />
        ) : null,
      )}
    </svg>
  );
}

function LevelRow({
  level,
  onEdit,
  onTogglePublish,
  onDelete,
  onDuplicate,
}: {
  level: Level;
  onEdit: (l: Level) => void;
  onTogglePublish: (l: Level) => void;
  onDelete: (l: Level) => void;
  onDuplicate: (l: Level) => void;
}) {
  const track = level.starter_track as StarterTrack | null;
  const nodes = track?.nodes ?? [];
  const loop = track?.loop ?? false;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        background: "rgba(0,0,0,.25)",
        border: `2px solid ${level.is_published ? "#2ED573" : "#4a2aa6"}`,
        borderRadius: 14,
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 28,
          textAlign: "center",
          fontFamily: "'JetBrains Mono',monospace",
          fontWeight: 700,
          fontSize: 13,
          color: "#B7AEE0",
        }}
      >
        #{level.order_index}
      </div>

      <MiniTrack nodes={nodes} loop={loop} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'Fredoka',system-ui,sans-serif",
            fontWeight: 700,
            fontSize: 16,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {level.title}
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
          <span>{SCENARIO_LABEL[level.scenario] ?? level.scenario}</span>
          <span>
            ⭐{level.star1_score} ⭐⭐{level.star2_score} ⭐⭐⭐{level.star3_score}
          </span>
          <span>
            🪙+{level.reward_coins} ✨+{level.reward_xp}
          </span>
          <span>{(level.objectives as Objective[]).length} objetivos</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <span
          style={{
            fontFamily: "'Fredoka',system-ui,sans-serif",
            fontWeight: 700,
            fontSize: 11,
            padding: "3px 10px",
            borderRadius: 20,
            background: level.is_published ? "rgba(46,213,115,.15)" : "rgba(255,255,255,.07)",
            color: level.is_published ? "#2ED573" : "#B7AEE0",
            border: `1px solid ${level.is_published ? "rgba(46,213,115,.4)" : "rgba(255,255,255,.12)"}`,
          }}
        >
          {level.is_published ? "Publicado" : "Rascunho"}
        </span>
        <button
          onClick={() => onEdit(level)}
          style={S.btn("linear-gradient(180deg,#70A1FF,#3a6fd8)")}
        >
          Editar
        </button>
        <button
          onClick={() => onDuplicate(level)}
          style={S.btn("rgba(255,255,255,.1)")}
          title="Duplicar como rascunho"
        >
          📋
        </button>
        <button
          onClick={() => onTogglePublish(level)}
          style={S.btn(
            level.is_published
              ? "linear-gradient(180deg,#FF4757,#a02030)"
              : "linear-gradient(180deg,#2ED573,#1a8a46)",
          )}
        >
          {level.is_published ? "Despublicar" : "Publicar"}
        </button>
        <button
          onClick={() => onDelete(level)}
          style={{
            ...S.btn("rgba(255,71,87,.2)"),
            color: "#FF4757",
            border: "1px solid rgba(255,71,87,.3)",
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

const DEFAULT_FORM = {
  title: "",
  description: "",
  scenario: "parque",
  order_index: 1,
  star1_score: 30,
  star2_score: 60,
  star3_score: 90,
  reward_coins: 100,
  reward_xp: 50,
  objectivesRaw:
    '[{"type":"survive","label":"Complete sem crashar"},{"type":"adrenaline","label":"Alcance 4G de força"}]',
  starter_track_raw: "",
  is_published: false,
};

type FormState = typeof DEFAULT_FORM;

function levelToForm(l: Level): FormState {
  return {
    title: l.title,
    description: l.description ?? "",
    scenario: l.scenario,
    order_index: l.order_index,
    star1_score: l.star1_score,
    star2_score: l.star2_score,
    star3_score: l.star3_score,
    reward_coins: l.reward_coins,
    reward_xp: l.reward_xp,
    objectivesRaw: JSON.stringify(l.objectives, null, 2),
    starter_track_raw: l.starter_track ? JSON.stringify(l.starter_track, null, 2) : "",
    is_published: l.is_published,
  };
}

function LevelForm({
  initial,
  editingId,
  onSave,
  onCancel,
}: {
  initial: FormState;
  editingId: number | null;
  onSave: (form: FormState) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackPreview, setTrackPreview] = useState<StarterTrack | null>(null);

  useEffect(() => {
    try {
      const parsed = JSON.parse(form.starter_track_raw) as StarterTrack;
      if (parsed?.nodes) setTrackPreview(parsed);
      else setTrackPreview(null);
    } catch {
      setTrackPreview(null);
    }
  }, [form.starter_track_raw]);

  function set(key: keyof FormState, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = { ...S.input, marginBottom: 0 };

  return (
    <div style={{ ...S.card, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 20 }}>
        {editingId ? `Editar Fase #${editingId}` : "Nova Fase"}
      </div>

      {error && (
        <div
          style={{
            background: "rgba(255,71,87,.15)",
            border: "2px solid rgba(255,71,87,.4)",
            borderRadius: 10,
            padding: "10px 14px",
            color: "#FF4757",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={S.label}>Título *</label>
          <input
            style={inputStyle}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="ex: Primeira Descida"
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={S.label}>Descrição</label>
          <textarea
            style={{ ...inputStyle, minHeight: 72, resize: "vertical" as const }}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Descreva o desafio desta fase..."
          />
        </div>

        <div>
          <label style={S.label}>Cenário</label>
          <select
            style={{ ...S.select, width: "100%" }}
            value={form.scenario}
            onChange={(e) => set("scenario", e.target.value)}
          >
            {SCENARIOS.map((s) => (
              <option key={s} value={s}>
                {SCENARIO_LABEL[s]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={S.label}>Ordem (order_index)</label>
          <input
            style={inputStyle}
            type="number"
            value={form.order_index}
            onChange={(e) => set("order_index", Number(e.target.value))}
          />
        </div>

        <div>
          <label style={S.label}>Score ⭐ (1 estrela)</label>
          <input
            style={inputStyle}
            type="number"
            value={form.star1_score}
            onChange={(e) => set("star1_score", Number(e.target.value))}
          />
        </div>
        <div>
          <label style={S.label}>Score ⭐⭐ (2 estrelas)</label>
          <input
            style={inputStyle}
            type="number"
            value={form.star2_score}
            onChange={(e) => set("star2_score", Number(e.target.value))}
          />
        </div>
        <div>
          <label style={S.label}>Score ⭐⭐⭐ (3 estrelas)</label>
          <input
            style={inputStyle}
            type="number"
            value={form.star3_score}
            onChange={(e) => set("star3_score", Number(e.target.value))}
          />
        </div>
        <div>
          <label style={S.label}>Recompensa 🪙 Coins</label>
          <input
            style={inputStyle}
            type="number"
            value={form.reward_coins}
            onChange={(e) => set("reward_coins", Number(e.target.value))}
          />
        </div>
        <div>
          <label style={S.label}>Recompensa ✨ XP</label>
          <input
            style={inputStyle}
            type="number"
            value={form.reward_xp}
            onChange={(e) => set("reward_xp", Number(e.target.value))}
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={S.label}>Objetivos (JSON)</label>
          <textarea
            style={{
              ...inputStyle,
              minHeight: 96,
              resize: "vertical" as const,
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 12,
            }}
            value={form.objectivesRaw}
            onChange={(e) => set("objectivesRaw", e.target.value)}
            spellCheck={false}
          />
          <div style={{ fontSize: 11, color: "#B7AEE0", marginTop: 4 }}>
            Array de {`{type, label}`}. Ex: {`{"type":"survive","label":"Complete sem crashar"}`}
          </div>
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={S.label}>Pista Inicial (JSON) — cole o track data do play.html</label>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <textarea
              style={{
                ...inputStyle,
                flex: 1,
                minHeight: 120,
                resize: "vertical" as const,
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 11,
              }}
              value={form.starter_track_raw}
              onChange={(e) => set("starter_track_raw", e.target.value)}
              placeholder={'{"nodes":[{"x":400,"y":300,"kind":"normal"},...],"loop":false}'}
              spellCheck={false}
            />
            <div style={{ flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: "#B7AEE0", marginBottom: 6 }}>Preview</div>
              {trackPreview ? (
                <MiniTrack nodes={trackPreview.nodes} loop={trackPreview.loop} />
              ) : (
                <div
                  style={{
                    width: 160,
                    height: 60,
                    borderRadius: 8,
                    background: "rgba(0,0,0,.25)",
                    border: "2px dashed rgba(255,255,255,.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#B7AEE0",
                    fontSize: 11,
                  }}
                >
                  JSON inválido
                </div>
              )}
            </div>
          </div>
          <div style={{ fontSize: 11, color: "#B7AEE0", marginTop: 4 }}>
            Dica: no{" "}
            <code style={{ background: "rgba(0,0,0,.3)", padding: "1px 5px", borderRadius: 4 }}>
              play.html
            </code>
            , salve uma pista e copie o JSON de{" "}
            <code style={{ background: "rgba(0,0,0,.3)", padding: "1px 5px", borderRadius: 4 }}>
              track_data
            </code>{" "}
            do banco.
          </div>
        </div>

        <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 10 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <div
              onClick={() => set("is_published", !form.is_published)}
              style={{
                width: 42,
                height: 24,
                borderRadius: 12,
                background: form.is_published ? "#2ED573" : "rgba(255,255,255,.15)",
                position: "relative",
                cursor: "pointer",
                transition: "background .2s",
                border: `2px solid ${form.is_published ? "#2ED573" : "rgba(255,255,255,.2)"}`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 2,
                  left: form.is_published ? 18 : 2,
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  background: "#fff",
                  transition: "left .2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,.3)",
                }}
              />
            </div>
            <span
              style={{
                fontFamily: "'Fredoka',system-ui,sans-serif",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {form.is_published ? "Publicado (visível no jogo)" : "Rascunho (invisível)"}
            </span>
          </label>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={handleSave}
          disabled={saving || !form.title.trim()}
          style={{
            ...S.btn("linear-gradient(180deg,#FFA502,#c97a00)"),
            opacity: saving || !form.title.trim() ? 0.5 : 1,
          }}
        >
          {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Criar fase"}
        </button>
        <button onClick={onCancel} style={{ ...S.btn("rgba(255,255,255,.08)"), color: "#B7AEE0" }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

export function AdminLevelsPage() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [formInitial, setFormInitial] = useState<FormState>(DEFAULT_FORM);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  async function fetchLevels() {
    const { data } = await supabase
      .from("levels")
      .select("*")
      .order("order_index", { ascending: true });
    setLevels((data ?? []) as Level[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchLevels();
  }, []);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  function openCreate() {
    setEditingLevel(null);
    setFormInitial(DEFAULT_FORM);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openEdit(l: Level) {
    setEditingLevel(l);
    setFormInitial(levelToForm(l));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function parseObjectives(raw: string): Objective[] {
    try {
      return JSON.parse(raw) as Objective[];
    } catch {
      return [];
    }
  }

  function parseTrack(raw: string): StarterTrack | null {
    try {
      const p = JSON.parse(raw) as StarterTrack;
      return p?.nodes ? p : null;
    } catch {
      return null;
    }
  }

  async function handleSave(form: FormState) {
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      scenario: form.scenario,
      order_index: form.order_index,
      star1_score: form.star1_score,
      star2_score: form.star2_score,
      star3_score: form.star3_score,
      reward_coins: form.reward_coins,
      reward_xp: form.reward_xp,
      objectives: parseObjectives(form.objectivesRaw),
      starter_track: parseTrack(form.starter_track_raw),
      is_published: form.is_published,
    };

    if (editingLevel) {
      const { error } = await supabase.from("levels").update(payload).eq("id", editingLevel.id);
      if (error) throw new Error(error.message);
      showToast("Fase atualizada!");
    } else {
      const { error } = await supabase.from("levels").insert(payload);
      if (error) throw new Error(error.message);
      showToast("Fase criada!");
    }

    setShowForm(false);
    setEditingLevel(null);
    await fetchLevels();
  }

  async function handleTogglePublish(l: Level) {
    const { error } = await supabase
      .from("levels")
      .update({ is_published: !l.is_published })
      .eq("id", l.id);
    if (error) {
      showToast(error.message, false);
      return;
    }
    showToast(l.is_published ? "Fase despublicada" : "Fase publicada!");
    await fetchLevels();
  }

  async function handleDuplicate(l: Level) {
    const maxOrder = levels.length > 0 ? Math.max(...levels.map((x) => x.order_index)) : 0;
    const payload = {
      title: `Cópia de ${l.title}`,
      description: l.description,
      scenario: l.scenario,
      order_index: maxOrder + 1,
      star1_score: l.star1_score,
      star2_score: l.star2_score,
      star3_score: l.star3_score,
      reward_coins: l.reward_coins,
      reward_xp: l.reward_xp,
      objectives: l.objectives,
      starter_track: l.starter_track,
      is_published: false,
    };
    const { error } = await supabase.from("levels").insert(payload);
    if (error) {
      showToast(error.message, false);
      return;
    }
    showToast("Fase duplicada como rascunho!");
    await fetchLevels();
  }

  async function handleDelete(l: Level) {
    if (!window.confirm(`Deletar a fase "${l.title}"? Esta ação não pode ser desfeita.`)) return;
    const { error } = await supabase.from("levels").delete().eq("id", l.id);
    if (error) {
      showToast(error.message, false);
      return;
    }
    showToast("Fase deletada.");
    await fetchLevels();
  }

  const published = levels.filter((l) => l.is_published);
  const drafts = levels.filter((l) => !l.is_published);

  return (
    <div style={S.content}>
      {/* Toast */}
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

      {/* Header */}
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
            🗺️ Gerenciar Fases
          </h1>
          <p style={{ color: "#B7AEE0", fontSize: 14, margin: "4px 0 0" }}>
            {published.length} publicadas · {drafts.length} rascunhos
          </p>
        </div>
        {!showForm && (
          <button onClick={openCreate} style={S.btn("linear-gradient(180deg,#FFA502,#c97a00)")}>
            + Nova Fase
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <LevelForm
          initial={formInitial}
          editingId={editingLevel?.id ?? null}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingLevel(null);
          }}
        />
      )}

      {/* List */}
      {loading ? (
        <div style={{ ...S.card, textAlign: "center", padding: 48 }}>
          <div
            style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontSize: 18, color: "#B7AEE0" }}
          >
            Carregando fases...
          </div>
        </div>
      ) : levels.length === 0 ? (
        <div style={{ ...S.card, textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚧</div>
          <div
            style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 18 }}
          >
            Nenhuma fase ainda
          </div>
          <div style={{ color: "#B7AEE0", marginTop: 8 }}>
            Clique em "Nova Fase" para criar a primeira.
          </div>
        </div>
      ) : (
        <>
          {published.length > 0 && (
            <div style={S.card}>
              <div
                style={{
                  fontFamily: "'Fredoka',system-ui,sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: ".6px",
                  textTransform: "uppercase",
                  color: "#2ED573",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#2ED573",
                    boxShadow: "0 0 0 3px rgba(46,213,115,.25)",
                  }}
                />
                Publicadas ({published.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {published.map((l) => (
                  <LevelRow
                    key={l.id}
                    level={l}
                    onEdit={openEdit}
                    onTogglePublish={handleTogglePublish}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </div>
            </div>
          )}

          {drafts.length > 0 && (
            <div style={S.card}>
              <div
                style={{
                  fontFamily: "'Fredoka',system-ui,sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: ".6px",
                  textTransform: "uppercase",
                  color: "#B7AEE0",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#B7AEE0",
                    boxShadow: "0 0 0 3px rgba(183,174,224,.2)",
                  }}
                />
                Rascunhos ({drafts.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {drafts.map((l) => (
                  <LevelRow
                    key={l.id}
                    level={l}
                    onEdit={openEdit}
                    onTogglePublish={handleTogglePublish}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
