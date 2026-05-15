# Game Design Document — Crash Coaster

> Versão condensada do GDD original para consulta rápida.
> Documento completo: `uploads/CRASH_COASTER___COMPLETE_GAME_DE.txt`
> Última atualização: 2026-05-11

---

## Conceito Central

**Gênero:** Sandbox 2D de construção de montanhas-russas
**Plataforma:** Web Browser (desktop-first, mobile futuramente)
**Tagline:** _"The game where failing is more fun than winning."_

O jogo equilibra **sobrevivência + adrenalina + caos + criatividade**.
O principal entretenimento vem dos **acidentes espetaculares e explosões hilárias**, não da perfeição.

---

## Pilares do Produto

| Pilar               | Descrição                                    |
| ------------------- | -------------------------------------------- |
| Engenharia Criativa | Construir pistas com lógica física real      |
| Caos Divertido      | Falhas são parte da experiência, não punição |
| Humor Visual        | Animações, explosões e reações cômicas       |
| Fácil de Aprender   | Sistema simples e intuitivo                  |
| Difícil de Dominar  | Física recompensa aprendizado avançado       |

---

## Modos de Jogo

### Campanha

- Progressão por fases com orçamento, limite de peças e objetivos
- Sistema de estrelas (0–3) por fase
- Tentativas limitadas — ao acabar, reinicia a fase
- Novas peças desbloqueadas ao passar fases e atingir estrelas

### Sandbox

- Dinheiro e peças infinitos
- Foco em criatividade e compartilhamento
- Pistas podem ser publicadas e compartilhadas

---

## Game Loop

```
Construir pista → Testar física → Ver caos/explosões → Rir do desastre → Melhorar → Passar de fase
```

---

## Sistema de Construção

- Grid modular com snapping magnético
- Nós conectáveis com curvas suaves (Catmull-Rom)
- Ghost preview ao posicionar peças
- Highlight de conexão válida

### Peças MVP

| Peça               | Função                |
| ------------------ | --------------------- |
| Reta               | Trilho reto           |
| Curva              | Mudança de direção    |
| Subida             | Ganho de altitude     |
| Descida            | Perda de altitude     |
| Looping            | Loop completo         |
| Booster            | Acelera o carrinho    |
| Freio              | Desacelera o carrinho |
| Suporte estrutural | Sustenta a estrutura  |

### Peças Futuras (pós-MVP)

Canhão, mola, trilho magnético, trilho invisível, catapulta, túnel, elevador.

---

## Física — "Plausible Cinematic Physics"

A física deve parecer **plausível e consistente**, mas também **divertida, exagerada e dramática**.

### Dados do carrinho

- `mass`, `velocity`, `acceleration`, `angular velocity`, `drag`, `friction`

### Fórmula base

```
E_total = mgh + ½mv²
G-force = Math.hypot(ax, ay) / 9.8
```

### Limites de G-force

| Zona   | Faixa        | Efeito           |
| ------ | ------------ | ---------------- |
| Seguro | -1G até 4.5G | Normal           |
| Aviso  | 4.5G até 5G  | Feedback visual  |
| Crash  | > 5G         | Falha / explosão |

### Tick System

- 60 FPS de simulação
- deltaTime normalizado
- Futuro: otimização via Web Workers

---

## Sistema de Falha (Escala de 9 Níveis)

As falhas devem ser **engraçadas, progressivas, satisfatórias e altamente compartilháveis**.

| Nível | Evento                       |
| ----- | ---------------------------- |
| 1     | Trilho vibra                 |
| 2     | Faíscas                      |
| 3     | Parafusos soltam             |
| 4     | Carrinho balança             |
| 5     | Passageiros entram em pânico |
| 6     | Estrutura entorta            |
| 7     | Descarrilamento              |
| 8     | Explosão                     |
| 9     | Fantasmas aparecem           |

---

## Sistema de Score

| Métrica    | Objetivo                   |
| ---------- | -------------------------- |
| Survival   | Sobreviver ao percurso     |
| Adrenaline | G-forces altas sem crashar |
| Chaos      | Quase-mortes e riscos      |
| Smoothness | Conforto e suavidade       |
| Creativity | Originalidade do traçado   |

**Filosofia:** O jogo NÃO recompensa apenas segurança. O ideal é **caos controlado**.

---

## Personagens e Passageiros

- Simples, caricatos, expressivos, fáceis de ler visualmente
- Reações: gritar, comemorar, desmaiar, entrar em pânico, levantar braços

### Fantasmas (pós-crash)

- Fofos, neon, cartoon, engraçados
- Auréolas, rastros coloridos, expressões bobas, paraquedas
- Sem impacto em gameplay — apenas humor visual

---

## Explosões

- Exageradas, coloridas, cômicas, legíveis
- NUNCA: violentas, militares, gore

---

## Progressão — Cenários da Campanha

| Cenário          | Tema            |
| ---------------- | --------------- |
| Classic Fun Park | Parque clássico |
| Medieval Park    | Medieval        |
| Volcano Park     | Vulcão          |
| Cyber Park       | Cyberpunk       |
| Haunted Carnival | Terror cômico   |
| Space Coaster    | Espaço          |
| Desert Canyon    | Deserto         |
| Ice World        | Gelo            |

Cada cenário muda decoração, atmosfera, cores e ambientação.

---

## Câmera

- Lateral fixa com tracking horizontal suave
- Zoom dinâmico em alta velocidade
- Shake cinematográfico em explosões

---

## Economia

### Campanha

- Orçamento limitado por fase
- Custo por peça — incentiva otimização financeira

### Sandbox

- Recursos infinitos — liberdade total

---

## Gacha e Skins (pós-MVP)

### Sistema de Baús

| Raridade | Chance |
| -------- | ------ |
| Comum    | 75%    |
| Raro     | 18%    |
| Épico    | 6%     |
| Lendário | 1%     |

Skins alteram **apenas a aparência** (partículas, efeitos visuais). Nunca afetam gameplay.

---

## Monetização

**Filosofia:** Sem pay-to-win.

Monetização por:

- Skins e temas
- Partículas e efeitos visuais
- Explosões e fantasmas especiais
- Cosméticos em geral

---

## Ranking Global

Score final = soma ponderada de: sobrevivência + adrenalina + caos + criatividade + smoothness

---

## Compartilhamento Social

Players podem compartilhar: pistas, GIFs, explosões, resultados.

**Filosofia viral:** O jogo deve constantemente gerar momentos absurdos e GIFs engraçados.

### Replay GIF System (MVP)

- Sistema automático de geração de GIF
- Captura: quase acidentes, explosões, falhas absurdas

### Blueprint Pages (SEO)

- Cada pista gera página indexável
- Thumbnail automático, estatísticas, preview visual
- Open Graph, metadata automática

---

## Direção Visual

**Estilo principal:** Theme Park Toy — brinquedos de parque, miniaturas coloridas, kits modulares, plástico estilizado.

**Influência secundária:** Cartoon Network — exagero visual, reações absurdas, humor nonsense.

### Fazer

- Cores vibrantes
- Formas arredondadas
- Leitura visual clara
- Animações exageradas
- Forte feedback visual

### NÃO Fazer

- Realismo extremo
- Sangue ou horror pesado
- Texturas complexas
- UI realista
- Humanos realistas

---

## Paleta de Cores

| Elemento  | Cor                                        |
| --------- | ------------------------------------------ |
| Perigo    | `#FF4757`                                  |
| Seguro    | `#2ED573`                                  |
| Booster   | `#FFA502`                                  |
| Fantasmas | `#70A1FF`                                  |
| Explosões | `#FF7F50`                                  |
| Fundo UI  | Azul escuro / Roxo (`#170C3D` → `#0a0420`) |

---

## Áudio

**Música:** Divertida, energética, inspirada em parques temáticos.

**Sound Design:**

- Trilhos tremendo
- Explosões exageradas
- Gritos engraçados
- Fantasmas bobos
- Impacto forte

---

## Backoffice

**Admin principal:** `neigirao@gmail.com`

**Funções:**
| Papel | Permissões |
|---|---|
| Level Designer | Criar e editar fases |
| Moderator | Banir usuários, remover pistas |
| Economy Manager | Gerenciar itens e moedas |
| Analytics Viewer | Heatmaps e estatísticas |

---

## Analytics

**Métricas de produto:** retenção, fases abandonadas, pontos de falha, pistas mais compartilhadas, tempo médio de sessão.

**Gameplay analytics:** locais de explosão, peças mais usadas, curvas mais perigosas, G-force média.

---

## Roadmap

| Fase    | Features                                                                |
| ------- | ----------------------------------------------------------------------- |
| **MVP** | Editor, física, campanha, explosões, fantasmas, score, compartilhamento |
| **V2**  | Replay avançado, mais peças, ranking expandido, eventos                 |
| **V3**  | Creator economy, temporadas, marketplace, desafios especiais            |
