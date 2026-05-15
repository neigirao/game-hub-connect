import { describe, it, expect } from "vitest";
import { SHOP_ITEMS } from "../shop-items";

describe("SHOP_ITEMS", () => {
  it("has no duplicate ids", () => {
    const ids = SHOP_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all items have positive cost", () => {
    SHOP_ITEMS.forEach((item) => {
      expect(item.cost).toBeGreaterThan(0);
    });
  });

  it("all items have a valid category", () => {
    const valid = new Set(["badge", "skin", "scenario"]);
    SHOP_ITEMS.forEach((item) => {
      expect(valid.has(item.category)).toBe(true);
    });
  });

  it("all items have non-empty name, description and emoji", () => {
    SHOP_ITEMS.forEach((item) => {
      expect(item.name.length).toBeGreaterThan(0);
      expect(item.description.length).toBeGreaterThan(0);
      expect(item.emoji.length).toBeGreaterThan(0);
    });
  });
});
