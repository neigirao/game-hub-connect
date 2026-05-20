export type ShopItem = {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: "badge" | "skin" | "scenario";
  emoji: string;
  color: string;
  gachaOnly?: boolean; // true = only obtainable via gacha crate
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
  // Skins (purchasable)
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
  // Skins (gacha-exclusive)
  {
    id: "skin_ghost",
    name: "Carrinho Fantasma",
    description: "Exclusivo de cápsula — etéreo e assustador",
    cost: 0,
    category: "skin",
    emoji: "👻",
    color: "#B3ECFF",
    gachaOnly: true,
  },
  {
    id: "skin_inferno",
    name: "Carrinho Inferno",
    description: "Lendário exclusivo de cápsula — chamas e destruição",
    cost: 0,
    category: "skin",
    emoji: "🔥",
    color: "#FF4757",
    gachaOnly: true,
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
