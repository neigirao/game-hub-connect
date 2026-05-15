import { describe, it, expect } from "vitest";

// Mirrors the creativity score logic from play.html
function creativityScore(nodes: Array<{ kind: string }>): number {
  const specials = nodes.filter((n) => n.kind !== "normal");
  const uniqueKinds = new Set(specials.map((n) => n.kind)).size;
  const diversityBonus = uniqueKinds >= 3 && specials.length >= 4 ? 20 : 0;
  return Math.min(100, 30 + nodes.length * 4 + specials.length * 5 + diversityBonus);
}

describe("creativity score", () => {
  it("baseline: only normal nodes", () => {
    const nodes = Array.from({ length: 5 }, () => ({ kind: "normal" }));
    expect(creativityScore(nodes)).toBe(30 + 5 * 4); // 50
  });

  it("special nodes boost score", () => {
    const nodes = [{ kind: "normal" }, { kind: "normal" }, { kind: "booster" }, { kind: "brake" }];
    expect(creativityScore(nodes)).toBe(30 + 4 * 4 + 2 * 5); // 56
  });

  it("diversity bonus triggers with 3+ types and 4+ specials", () => {
    const nodes = [{ kind: "booster" }, { kind: "brake" }, { kind: "loop" }, { kind: "spring" }];
    const score = creativityScore(nodes);
    // 30 + 4*4 + 4*5 + 20 = 86
    expect(score).toBe(86);
  });

  it("diversity bonus does NOT trigger with only 2 special types", () => {
    const nodes = [{ kind: "booster" }, { kind: "booster" }, { kind: "brake" }, { kind: "brake" }];
    const score = creativityScore(nodes);
    // no bonus: 30 + 4*4 + 4*5 = 66
    expect(score).toBe(66);
  });

  it("caps at 100", () => {
    const nodes = Array.from({ length: 20 }, (_, i) => ({
      kind: ["booster", "brake", "loop", "spring"][i % 4],
    }));
    expect(creativityScore(nodes)).toBe(100);
  });
});
