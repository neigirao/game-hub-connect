import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageError, PulseSkeleton } from "@/components/page-error";

export const Route = createFileRoute("/tracks")({
  head: () => ({
    meta: [
      { title: "Pistas da Comunidade — Crash Coaster" },
      {
        name: "description",
        content:
          "Descubra e jogue as melhores pistas criadas pela comunidade do Crash Coaster. Curta suas favoritas e inspire-se para construir a próxima.",
      },
    ],
  }),
  component: TracksPage,
});

type Blueprint = {
  id: string;
  name: string;
  creator_id: string;
  best_total_score: number;
  likes: number;
  node_count: number;
  is_featured: boolean;
  created_at: string;
  profiles: { username: string } | null;
};

type SortKey = "featured" | "likes" | "score" | "recent";

const SORT_OPTS: Array<{ key: SortKey; label: string }> = [
  { key: "featured", label: "⭐ Destacadas" },
  { key: "likes", label: "❤️ Mais Curtidas" },
  { key: "score", label: "🏆 Maior Score" },
  { key: "recent", label: "🕐 Recentes" },
];

const S = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#1c0d52 0%,#0b052b 100%)",
    color: "#fff",
    fontFamily: "'Inter',system-ui,sans-serif",
    WebkitFontSmoothing: "antialiased" as const,
  },
  content: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 28,
  },
  card: {
    background: "linear-gradient(180deg,#2e1870,#1a0e50)",
    border: "2px solid #4a2aa6",
    borderRadius: 20,
    overflow: "hidden" as const,
    boxShadow: "0 6px 0 rgba(0,0,0,.3)",
    display: "flex",
    flexDirection: "column" as const,
    transition: "transform .15s ease",
  },
};

function LikeButton({
  blueprintId,
  initialLikes,
  initialLiked,
  userId,
}: {
  blueprintId: string;
  initialLikes: number;
  initialLiked: boolean;
  userId: string | null;
}) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [loading, setLoading] = useState(false);

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    if (!userId) {
      navigate({ to: "/login" });
      return;
    }
    if (loading) return;
    setLoading(true);
    const { data, error } = await supabase.rpc("toggle_blueprint_like", {
      p_blueprint_id: blueprintId,
    });
    if (!error && data) {
      setLiked((data as { liked: boolean }).liked);
      setLikes((data as { likes: number }).likes);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        fontFamily: "'Fredoka',system-ui,sans-serif",
        fontWeight: 700,
        fontSize: 13,
        padding: "6px 12px",
        borderRadius: 10,
        border: liked ? "2px solid #FF4757" : "2px solid rgba(255,255,255,.15)",
        background: liked ? "rgba(255,71,87,.15)" : "rgba(255,255,255,.06)",
        color: liked ? "#FF4757" : "#B7AEE0",
        cursor: "pointer",
        transition: "all .15s",
        flexShrink: 0,
      }}
    >
      {liked ? "❤️" : "🤍"} {likes}
    </button>
  );
}

function BlueprintCard({
  bp,
  likedIds,
  userId,
}: {
  bp: Blueprint;
  likedIds: Set<string>;
  userId: string | null;
}) {
  return (
    <div
      style={S.card}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      {/* Featured badge */}
      {bp.is_featured && (
        <div
          style={{
            background: "linear-gradient(90deg,#FFA502,#FF6BD6)",
            padding: "4px 14px",
            fontSize: 10,
            fontFamily: "'Fredoka',system-ui,sans-serif",
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase" as const,
            color: "#fff",
            textAlign: "center" as const,
          }}
        >
          ⭐ Destaque da Equipe
        </div>
      )}

      <div
        style={{
          padding: "16px 18px",
          display: "flex",
          flexDirection: "column" as const,
          gap: 12,
          flex: 1,
        }}
      >
        {/* Title + creator */}
        <div>
          <div
            style={{
              fontFamily: "'Fredoka',system-ui,sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: "#fff",
              marginBottom: 3,
              whiteSpace: "nowrap" as const,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {bp.name}
          </div>
          <div style={{ fontSize: 11, color: "#B7AEE0" }}>
            por <span style={{ color: "#FF6BD6" }}>{bp.profiles?.username ?? "Anônimo"}</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
          {[
            { label: "Score", value: bp.best_total_score, color: "#FFA502" },
            { label: "Nós", value: bp.node_count, color: "#70A1FF" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "rgba(0,0,0,.3)",
                border: "1px solid rgba(255,255,255,.08)",
                borderRadius: 8,
                padding: "5px 10px",
                fontSize: 12,
              }}
            >
              <span
                style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontWeight: 700,
                  color: s.color,
                }}
              >
                {s.value}
              </span>{" "}
              <span style={{ color: "#B7AEE0", fontSize: 10 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, marginTop: "auto", alignItems: "center" }}>
          <a
            href={`/play.html?blueprint=${bp.id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              fontFamily: "'Fredoka',system-ui,sans-serif",
              fontWeight: 700,
              fontSize: 13,
              padding: "8px 14px",
              borderRadius: 12,
              background: "linear-gradient(180deg,#FFA502,#c97a00)",
              border: "2px solid #FFCB6B",
              color: "#fff",
              textDecoration: "none",
              textAlign: "center" as const,
              boxShadow: "0 3px 0 #6e3f00",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Jogar
          </a>
          <LikeButton
            blueprintId={bp.id}
            initialLikes={bp.likes}
            initialLiked={likedIds.has(bp.id)}
            userId={userId}
          />
        </div>
      </div>
    </div>
  );
}

export function TracksPage() {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("featured");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const load = useCallback(async (currentSort: SortKey) => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const uid = session?.user.id ?? null;
      setUserId(uid);

      let query = supabase
        .from("blueprints")
        .select(
          "id,name,creator_id,best_total_score,likes,node_count,is_featured,created_at,profiles(username)",
        )
        .eq("is_public", true);

      if (currentSort === "featured") {
        query = query
          .order("is_featured", { ascending: false })
          .order("likes", { ascending: false });
      } else if (currentSort === "likes") {
        query = query.order("likes", { ascending: false });
      } else if (currentSort === "score") {
        query = query.order("best_total_score", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const [bpRes, likesRes] = await Promise.all([
        query.limit(60),
        uid
          ? supabase.from("blueprint_likes").select("blueprint_id").eq("user_id", uid)
          : Promise.resolve({ data: [] }),
      ]);

      if (bpRes.error) throw bpRes.error;

      setBlueprints((bpRes.data ?? []) as Blueprint[]);
      setLikedIds(
        new Set((likesRes.data ?? []).map((r: { blueprint_id: string }) => r.blueprint_id)),
      );
      setLoading(false);
    } catch {
      setError("Não foi possível carregar as pistas.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(sort);
  }, [sort, load, retryCount]);

  const featured = blueprints.filter((b) => b.is_featured);
  const rest = blueprints.filter((b) => !b.is_featured || sort !== "featured");

  return (
    <div style={S.page}>
      <style>{`
        @keyframes slideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={S.content}>
        {/* Header */}
        <div>
          <h1
            style={{
              fontFamily: "'Fredoka',system-ui,sans-serif",
              fontWeight: 700,
              fontSize: 36,
              margin: 0,
              lineHeight: 1,
            }}
          >
            🎢 Pistas da Comunidade
          </h1>
          <p style={{ color: "#B7AEE0", fontSize: 15, marginTop: 8, marginBottom: 0 }}>
            Jogue as pistas criadas por outros jogadores, curta as favoritas e inspire-se.
          </p>
        </div>

        {/* Sort tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
          {SORT_OPTS.map((o) => (
            <button
              key={o.key}
              onClick={() => setSort(o.key)}
              style={{
                fontFamily: "'Fredoka',system-ui,sans-serif",
                fontWeight: 700,
                fontSize: 13,
                padding: "7px 16px",
                borderRadius: 12,
                border: sort === o.key ? "2px solid #FF6BD6" : "2px solid rgba(255,255,255,.12)",
                background: sort === o.key ? "rgba(255,107,214,.18)" : "rgba(255,255,255,.06)",
                color: sort === o.key ? "#FF6BD6" : "#B7AEE0",
                cursor: "pointer",
                transition: "all .15s",
              }}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {error ? (
          <PageError message={error} onRetry={() => setRetryCount((c) => c + 1)} />
        ) : loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
              gap: 18,
            }}
          >
            {Array.from({ length: 9 }).map((_, i) => (
              <PulseSkeleton key={i} height={200} borderRadius={20} delay={i * 0.07} />
            ))}
          </div>
        ) : blueprints.length === 0 ? (
          <div
            style={{
              background: "linear-gradient(180deg,#2e1870,#1a0e50)",
              border: "2px solid #4a2aa6",
              borderRadius: 20,
              padding: 48,
              textAlign: "center" as const,
              color: "#B7AEE0",
            }}
          >
            <div style={{ fontSize: 52, marginBottom: 12 }}>🏗️</div>
            <div
              style={{
                fontFamily: "'Fredoka',system-ui,sans-serif",
                fontWeight: 700,
                fontSize: 20,
                color: "#fff",
              }}
            >
              Nenhuma pista pública ainda
            </div>
            <div style={{ fontSize: 14, marginTop: 8 }}>
              Construa uma pista e marque como pública para aparecer aqui!
            </div>
            <a
              href="/play.html"
              style={{
                display: "inline-block",
                marginTop: 20,
                fontFamily: "'Fredoka',system-ui,sans-serif",
                fontWeight: 700,
                fontSize: 15,
                padding: "10px 28px",
                borderRadius: 14,
                background: "linear-gradient(180deg,#FFA502,#c97a00)",
                color: "#fff",
                textDecoration: "none",
                boxShadow: "0 4px 0 rgba(0,0,0,.3)",
              }}
            >
              🎢 Construir pista
            </a>
          </div>
        ) : (
          <>
            {/* Featured section */}
            {sort === "featured" && featured.length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: 1,
                    textTransform: "uppercase" as const,
                    color: "#FFA502",
                    fontWeight: 700,
                    marginBottom: 14,
                  }}
                >
                  Destaques da equipe
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
                    gap: 18,
                  }}
                >
                  {featured.map((bp, i) => (
                    <div key={bp.id} style={{ animation: `slideIn .3s ease ${i * 0.06}s both` }}>
                      <BlueprintCard bp={bp} likedIds={likedIds} userId={userId} />
                    </div>
                  ))}
                </div>
                {rest.length > 0 && (
                  <div
                    style={{
                      fontSize: 12,
                      letterSpacing: 1,
                      textTransform: "uppercase" as const,
                      color: "#B7AEE0",
                      fontWeight: 700,
                      marginTop: 28,
                      marginBottom: 14,
                    }}
                  >
                    Todas as pistas
                  </div>
                )}
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
                gap: 18,
              }}
            >
              {(sort === "featured" ? rest : blueprints).map((bp, i) => (
                <div key={bp.id} style={{ animation: `slideIn .3s ease ${i * 0.04}s both` }}>
                  <BlueprintCard bp={bp} likedIds={likedIds} userId={userId} />
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && !userId && blueprints.length > 0 && (
          <div
            style={{
              textAlign: "center" as const,
              color: "#B7AEE0",
              fontSize: 13,
              paddingBottom: 8,
            }}
          >
            <Link to="/login" style={{ color: "#FF6BD6", textDecoration: "none", fontWeight: 700 }}>
              Faça login
            </Link>{" "}
            para curtir pistas e salvar suas favoritas.
          </div>
        )}
      </div>
    </div>
  );
}
