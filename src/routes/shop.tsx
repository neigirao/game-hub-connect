import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageError, PulseSkeleton } from "@/components/page-error";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Loja — Crash Coaster" },
      { name: "description", content: "Gaste suas moedas em badges, skins e cenários exclusivos do Crash Coaster." },
    ],
  }),
  component: ShopPage,
});

type ShopItem = {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: "badge" | "skin" | "scenario";
  emoji: string;
  color: string;
};

export const SHOP_ITEMS: ShopItem[] = [
  // Badges
  {
    id: "badge_parque",
    name: "Mestre do Parque",
    description: "Para quem domina os loops e as curvas do parque",
    cost: 200,
    category: "badge",
    emoji: "🎡",
    color: "#2ED573",
  },
  {
    id: "badge_vulcao",
    name: "Explorador de Vulcão",
    description: "Não tem medo do magma nem de 5G de força",
    cost: 500,
    category: "badge",
    emoji: "🌋",
    color: "#FF4757",
  },
  {
    id: "badge_praia",
    name: "Surfista do Caos",
    description: "Relaxa mesmo na curva mais insana da praia",
    cost: 800,
    category: "badge",
    emoji: "🏖️",
    color: "#FFA502",
  },
  {
    id: "badge_espaco",
    name: "Astronauta do Descarrilamento",
    description: "Caiu do trilho e foi parar na órbita",
    cost: 1500,
    category: "badge",
    emoji: "🚀",
    color: "#70A1FF",
  },
  // Skins do carrinho
  {
    id: "skin_candy",
    name: "Carrinho Candy",
    description: "Skin rosa chiclete — doce e imparável",
    cost: 1000,
    category: "skin",
    emoji: "🍬",
    color: "#FF6BD6",
  },
  {
    id: "skin_gold",
    name: "Carrinho Dourado",
    description: "Reservado para os campeões do caos",
    cost: 3000,
    category: "skin",
    emoji: "🏆",
    color: "#FFA502",
  },
  {
    id: "skin_rocket",
    name: "Foguete Supersônico",
    description: "Mais aerodinâmico, mais caótico, mais fogo",
    cost: 2000,
    category: "skin",
    emoji: "🚀",
    color: "#FF4757",
  },
  // Cenários
  {
    id: "cenario_praia",
    name: "Cenário Praia",
    description: "Areia, sol e ondas — caos com bronzeado garantido",
    cost: 600,
    category: "scenario",
    emoji: "🏖️",
    color: "#FFA502",
  },
  {
    id: "cenario_noite",
    name: "Cenário Noite",
    description: "Céu estrelado — crashes mais dramáticos sob a lua",
    cost: 900,
    category: "scenario",
    emoji: "🌙",
    color: "#70A1FF",
  },
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
    maxWidth: 960,
    margin: "0 auto",
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 32,
  },
};

function categoryLabel(cat: ShopItem["category"]) {
  if (cat === "badge") return "Badge";
  if (cat === "skin") return "Skin";
  return "Cenário";
}

function ShopCard({
  item,
  owned,
  coins,
  onBuy,
  buying,
  equipped,
  onEquip,
}: {
  item: ShopItem;
  owned: boolean;
  coins: number;
  onBuy: (item: ShopItem) => void;
  buying: string | null;
  equipped: boolean;
  onEquip: (item: ShopItem) => void;
}) {
  const canAfford = coins >= item.cost;
  const isLoading = buying === item.id;
  const isEquippable = item.category === "skin" || item.category === "scenario";

  return (
    <div
      style={{
        background: owned
          ? "linear-gradient(180deg,#1a3a1a,#0e2010)"
          : "linear-gradient(180deg,#2e1870,#1a0e50)",
        border: equipped
          ? "2px solid #FFA502"
          : owned
          ? "2px solid #2ED573"
          : "2px solid #4a2aa6",
        borderRadius: 20,
        padding: "20px 20px 16px",
        display: "flex",
        flexDirection: "column" as const,
        gap: 12,
        boxShadow: equipped
          ? "0 6px 0 #6e3f00, 0 0 0 3px rgba(255,165,2,.15)"
          : owned
          ? "0 6px 0 #0a1a0a"
          : "0 6px 0 rgba(0,0,0,.3)",
        transition: "transform .15s ease",
        position: "relative" as const,
      }}
      onMouseEnter={(e) => !owned && (e.currentTarget.style.transform = "translateY(-3px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      {equipped && (
        <div style={{
          position: "absolute" as const,
          top: 10,
          right: 10,
          fontSize: 9,
          fontFamily: "'Fredoka',system-ui,sans-serif",
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: "uppercase" as const,
          padding: "2px 8px",
          borderRadius: 8,
          background: "rgba(255,165,2,.25)",
          color: "#FFA502",
          border: "1px solid rgba(255,165,2,.5)",
        }}>
          ✓ Equipado
        </div>
      )}

      {/* Icon */}
      <div style={{ fontSize: 48, textAlign: "center" as const, filter: `drop-shadow(0 2px 8px ${item.color}60)` }}>
        {item.emoji}
      </div>

      {/* Info */}
      <div style={{ textAlign: "center" as const }}>
        <div style={{
          fontFamily: "'Fredoka',system-ui,sans-serif",
          fontWeight: 700,
          fontSize: 16,
          color: equipped ? "#FFA502" : owned ? "#2ED573" : "#fff",
          marginBottom: 4,
        }}>
          {item.name}
        </div>
        <div style={{ fontSize: 11, color: "#B7AEE0", lineHeight: 1.4 }}>
          {item.description}
        </div>
      </div>

      {/* Category tag */}
      <div style={{ textAlign: "center" as const }}>
        <span style={{
          fontSize: 10,
          fontFamily: "'Fredoka',system-ui,sans-serif",
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: "uppercase" as const,
          padding: "2px 10px",
          borderRadius: 20,
          background: `${item.color}22`,
          color: item.color,
          border: `1px solid ${item.color}55`,
        }}>
          {categoryLabel(item.category)}
        </span>
      </div>

      {/* CTA */}
      {owned ? (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
          {isEquippable && !equipped && (
            <button
              onClick={() => onEquip(item)}
              style={{
                fontFamily: "'Fredoka',system-ui,sans-serif",
                fontWeight: 700,
                fontSize: 14,
                padding: "9px",
                borderRadius: 12,
                border: "2px solid #FFCB6B",
                background: "linear-gradient(180deg,#FFA502,#c97a00)",
                color: "#fff",
                cursor: "pointer",
                boxShadow: "0 3px 0 #6e3f00",
                transition: "all .15s",
              }}
            >
              ⚡ Equipar
            </button>
          )}
          {(!isEquippable || equipped) && (
            <div style={{
              textAlign: "center" as const,
              fontFamily: "'Fredoka',system-ui,sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: equipped ? "#FFA502" : "#2ED573",
              padding: "8px",
            }}>
              {equipped ? "✓ Equipado" : "✓ Você tem este item"}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => onBuy(item)}
          disabled={!canAfford || isLoading}
          style={{
            fontFamily: "'Fredoka',system-ui,sans-serif",
            fontWeight: 700,
            fontSize: 14,
            padding: "10px",
            borderRadius: 12,
            border: canAfford ? "2px solid #FFCB6B" : "2px solid rgba(255,255,255,.15)",
            background: canAfford
              ? "linear-gradient(180deg,#FFA502,#c97a00)"
              : "rgba(255,255,255,.06)",
            color: canAfford ? "#fff" : "#B7AEE0",
            cursor: canAfford ? "pointer" : "not-allowed",
            boxShadow: canAfford ? "0 3px 0 #6e3f00" : "none",
            transition: "all .15s",
          }}
        >
          {isLoading ? "..." : `🪙 ${item.cost.toLocaleString()} moedas`}
        </button>
      )}
    </div>
  );
}

export function ShopPage() {
  const [coins, setCoins] = useState(0);
  const [inventory, setInventory] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [equippedSkin, setEquippedSkin] = useState<string>(() =>
    typeof window !== "undefined" ? localStorage.getItem("cc_cart_skin") ?? "" : ""
  );
  const [equippedScenario, setEquippedScenario] = useState<string>(() =>
    typeof window !== "undefined" ? localStorage.getItem("cc_scenario") ?? "" : ""
  );

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) { setLoading(false); return; }
        setUserId(session.user.id);

        const { data, error: err } = await supabase
          .from("profiles")
          .select("coins,inventory")
          .eq("id", session.user.id)
          .single();

        if (err) throw err;
        setCoins(data.coins ?? 0);
        setInventory(Array.isArray(data.inventory) ? data.inventory as string[] : []);
        setLoading(false);
      } catch {
        setError("Não foi possível carregar a loja.");
        setLoading(false);
      }
    }
    load();
  }, [retryCount]);

  async function handleBuy(item: ShopItem) {
    if (!userId) { window.location.href = "/login"; return; }
    setBuying(item.id);
    const { data, error: err } = await supabase.rpc("purchase_shop_item", {
      p_item_id: item.id,
      p_item_cost: item.cost,
    });
    setBuying(null);

    if (err) {
      if (err.message.includes("insufficient_coins")) {
        showToast("Moedas insuficientes! 🪙", false);
      } else if (err.message.includes("already_owned")) {
        showToast("Você já tem este item!", false);
      } else {
        showToast("Erro ao comprar. Tente novamente.", false);
      }
      return;
    }

    const result = data as { new_coins: number };
    setCoins(result.new_coins);
    setInventory((prev) => [...prev, item.id]);
    showToast(`${item.emoji} ${item.name} adquirido!`);
  }

  function handleEquip(item: ShopItem) {
    if (item.category === "skin") {
      const newSkin = equippedSkin === item.id ? "" : item.id;
      localStorage.setItem("cc_cart_skin", newSkin);
      setEquippedSkin(newSkin);
      showToast(newSkin ? `${item.emoji} ${item.name} equipado!` : "Skin removida");
    } else if (item.category === "scenario") {
      const newScenario = equippedScenario === item.id ? "" : item.id;
      localStorage.setItem("cc_scenario", newScenario);
      setEquippedScenario(newScenario);
      showToast(newScenario ? `${item.emoji} ${item.name} equipado!` : "Cenário padrão restaurado");
    }
  }

  const badges = SHOP_ITEMS.filter((i) => i.category === "badge");
  const skins = SHOP_ITEMS.filter((i) => i.category === "skin");
  const scenarios = SHOP_ITEMS.filter((i) => i.category === "scenario");

  return (
    <div style={S.page}>
      <style>{`
        @keyframes slideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed",
          top: 80,
          right: 20,
          zIndex: 9999,
          background: toast.ok ? "linear-gradient(135deg,#2ED573,#1a8a46)" : "linear-gradient(135deg,#FF4757,#8a1a1a)",
          color: "#fff",
          borderRadius: 14,
          padding: "12px 20px",
          fontFamily: "'Fredoka',system-ui,sans-serif",
          fontWeight: 700,
          fontSize: 15,
          boxShadow: "0 4px 20px rgba(0,0,0,.4)",
          animation: "toastIn .3s ease",
        }}>
          {toast.msg}
        </div>
      )}

      <div style={S.content}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 36, margin: 0, lineHeight: 1 }}>
              🛒 Loja
            </h1>
            <p style={{ color: "#B7AEE0", fontSize: 15, marginTop: 8, marginBottom: 0 }}>
              Gaste suas moedas em badges, skins e cenários exclusivos.
            </p>
          </div>
          {userId && !loading && (
            <div style={{
              background: "linear-gradient(180deg,#2e1870,#1a0e50)",
              border: "2px solid #4a2aa6",
              borderRadius: 16,
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 0 rgba(0,0,0,.3)",
            }}>
              <span style={{ fontSize: 20 }}>🪙</span>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 22, color: "#FFA502", lineHeight: 1 }}>
                  {coins.toLocaleString()}
                </div>
                <div style={{ fontSize: 10, color: "#B7AEE0", letterSpacing: 1, textTransform: "uppercase" as const }}>
                  moedas
                </div>
              </div>
            </div>
          )}
        </div>

        {!userId && !loading ? (
          <div style={{
            background: "linear-gradient(180deg,#2e1870,#1a0e50)",
            border: "2px solid #4a2aa6",
            borderRadius: 20,
            padding: 48,
            textAlign: "center" as const,
            color: "#B7AEE0",
          }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🔐</div>
            <div style={{ fontFamily: "'Fredoka',system-ui,sans-serif", fontWeight: 700, fontSize: 20, color: "#fff", marginBottom: 16 }}>
              Faça login para usar a loja
            </div>
            <Link
              to="/login"
              style={{
                fontFamily: "'Fredoka',system-ui,sans-serif",
                fontWeight: 700,
                fontSize: 15,
                padding: "10px 28px",
                borderRadius: 14,
                background: "linear-gradient(180deg,#FF6BD6,#a8329c)",
                color: "#fff",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Entrar com Google
            </Link>
          </div>
        ) : error ? (
          <PageError message={error} onRetry={() => setRetryCount((c) => c + 1)} />
        ) : loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 18 }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <PulseSkeleton key={i} height={240} borderRadius={20} delay={i * 0.06} />
            ))}
          </div>
        ) : (
          <>
            {/* Badges */}
            <div>
              <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase" as const, color: "#B7AEE0", fontWeight: 700, marginBottom: 16 }}>
                Badges de perfil
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 18 }}>
                {badges.map((item, i) => (
                  <div key={item.id} style={{ animation: `slideIn .3s ease ${i * 0.07}s both` }}>
                    <ShopCard
                      item={item}
                      owned={inventory.includes(item.id)}
                      coins={coins}
                      onBuy={handleBuy}
                      buying={buying}
                      equipped={false}
                      onEquip={handleEquip}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Skins do carrinho */}
            <div>
              <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase" as const, color: "#B7AEE0", fontWeight: 700, marginBottom: 16 }}>
                Skins do carrinho
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 18 }}>
                {skins.map((item, i) => (
                  <div key={item.id} style={{ animation: `slideIn .3s ease ${(badges.length + i) * 0.07}s both` }}>
                    <ShopCard
                      item={item}
                      owned={inventory.includes(item.id)}
                      coins={coins}
                      onBuy={handleBuy}
                      buying={buying}
                      equipped={equippedSkin === item.id}
                      onEquip={handleEquip}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Cenários */}
            <div>
              <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase" as const, color: "#B7AEE0", fontWeight: 700, marginBottom: 16 }}>
                Cenários
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 18 }}>
                {scenarios.map((item, i) => (
                  <div key={item.id} style={{ animation: `slideIn .3s ease ${(badges.length + skins.length + i) * 0.07}s both` }}>
                    <ShopCard
                      item={item}
                      owned={inventory.includes(item.id)}
                      coins={coins}
                      onBuy={handleBuy}
                      buying={buying}
                      equipped={equippedScenario === item.id}
                      onEquip={handleEquip}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: "center" as const, color: "#B7AEE0", fontSize: 12, paddingBottom: 8 }}>
              Ganhe moedas jogando corridas e conquistando estrelas nas fases da campanha.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
