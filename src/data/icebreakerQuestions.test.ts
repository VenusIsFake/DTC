import { describe, it, expect } from "vitest";
import {
  ICEBREAKER_QUESTIONS,
  getRandomIcebreakerQuestion,
  CATEGORY_CONFIG,
  IcebreakerCategory,
} from "./icebreakerQuestions";

describe("Icebreaker Questions Dataset", () => {
  it("contains exactly 100 questions", () => {
    expect(ICEBREAKER_QUESTIONS).toHaveLength(100);
  });

  it("has unique IDs from 1 to 100", () => {
    const ids = ICEBREAKER_QUESTIONS.map((q) => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(100);
    for (let i = 1; i <= 100; i++) {
      expect(uniqueIds.has(i)).toBe(true);
    }
  });

  it("has 20 questions per category", () => {
    const categories: IcebreakerCategory[] = [
      "dental",
      "academic",
      "dilemma",
      "culture",
      "stand",
    ];

    categories.forEach((cat) => {
      const items = ICEBREAKER_QUESTIONS.filter((q) => q.category === cat);
      expect(items).toHaveLength(20);
    });
  });

  it("has valid non-empty fields in every question", () => {
    ICEBREAKER_QUESTIONS.forEach((q) => {
      expect(q.id).toBeGreaterThan(0);
      expect(q.question.trim().length).toBeGreaterThan(15);
      expect(q.hint.trim().length).toBeGreaterThan(10);
      expect(q.categoryLabel.trim().length).toBeGreaterThan(2);
      expect(q.categoryEmoji.trim().length).toBeGreaterThan(0);
      expect(CATEGORY_CONFIG[q.category]).toBeDefined();
    });
  });

  it("getRandomIcebreakerQuestion returns valid question across all and specific categories", () => {
    const randomAll = getRandomIcebreakerQuestion("all");
    expect(randomAll).toBeDefined();
    expect(randomAll.id).toBeGreaterThanOrEqual(1);
    expect(randomAll.id).toBeLessThanOrEqual(100);

    const randomDental = getRandomIcebreakerQuestion("dental");
    expect(randomDental.category).toBe("dental");

    const randomStand = getRandomIcebreakerQuestion("stand");
    expect(randomStand.category).toBe("stand");
  });

  it("getRandomIcebreakerQuestion respects excludeIds unless pool exhausted", () => {
    const excludeIds = [1, 2, 3, 4, 5];
    const q = getRandomIcebreakerQuestion("dental", excludeIds);
    expect(q.category).toBe("dental");
    // Since dental has 20 items, excluding 5 items still leaves 15
    expect(excludeIds).not.toContain(q.id);
  });
});
