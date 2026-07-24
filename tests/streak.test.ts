import { describe, expect, it } from "vitest";
import { computeStreak } from "@/lib/streak";

describe("computeStreak", () => {
  it("counts consecutive days ending today", () => {
    const streak = computeStreak(
      [
        { date: "2026-07-21", tasksCompleted: 1 },
        { date: "2026-07-22", tasksCompleted: 2 },
        { date: "2026-07-23", tasksCompleted: 1 },
      ],
      "2026-07-23",
    );
    expect(streak).toBe(3);
  });

  it("breaks on a missing day", () => {
    const streak = computeStreak(
      [
        { date: "2026-07-21", tasksCompleted: 1 },
        { date: "2026-07-23", tasksCompleted: 1 },
      ],
      "2026-07-23",
    );
    expect(streak).toBe(1);
  });

  it("returns 0 when today has no completions", () => {
    expect(
      computeStreak([{ date: "2026-07-22", tasksCompleted: 3 }], "2026-07-23"),
    ).toBe(0);
  });
});
