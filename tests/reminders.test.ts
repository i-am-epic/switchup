import { describe, expect, it } from "vitest";
import {
  classifyTask,
  snoozeDates,
  sortNeedsAttention,
  dueBadge,
} from "@/lib/reminders";

const today = "2026-07-23";

describe("classifyTask", () => {
  it("classifies overdue before today", () => {
    expect(
      classifyTask(
        { status: "todo", dueDate: "2026-07-20", scheduledFor: today },
        today,
      ),
    ).toBe("overdue");
  });

  it("classifies today by scheduledFor", () => {
    expect(
      classifyTask({ status: "todo", scheduledFor: today }, today),
    ).toBe("today");
  });

  it("classifies pending older scheduled", () => {
    expect(
      classifyTask({ status: "todo", scheduledFor: "2026-07-21" }, today),
    ).toBe("pending");
  });

  it("classifies later", () => {
    expect(
      classifyTask({ status: "todo", scheduledFor: "2026-07-30" }, today),
    ).toBe("later");
  });

  it("classifies unscheduled", () => {
    expect(classifyTask({ status: "todo" }, today)).toBe("unscheduled");
  });
});

describe("sortNeedsAttention", () => {
  it("puts overdue before pending and sorts oldest first", () => {
    const sorted = sortNeedsAttention(
      [
        { id: "p", status: "todo", scheduledFor: "2026-07-21" },
        { id: "o2", status: "todo", dueDate: "2026-07-22" },
        { id: "o1", status: "todo", dueDate: "2026-07-10" },
      ],
      today,
    );
    expect(sorted.map((t) => t.id)).toEqual(["o1", "o2", "p"]);
  });
});

describe("snoozeDates", () => {
  it("sets both when none present", () => {
    expect(snoozeDates({ status: "todo" }, 1, today)).toEqual({
      dueDate: "2026-07-24",
      scheduledFor: "2026-07-24",
    });
  });

  it("bumps existing dates", () => {
    expect(
      snoozeDates(
        { status: "todo", dueDate: "2026-07-20", scheduledFor: "2026-07-21" },
        3,
        today,
      ),
    ).toEqual({ dueDate: "2026-07-23", scheduledFor: "2026-07-24" });
  });
});

describe("dueBadge", () => {
  it("returns Overdue / Today / Tomorrow", () => {
    expect(dueBadge({ status: "todo", dueDate: "2026-07-01" }, today)).toBe(
      "Overdue",
    );
    expect(dueBadge({ status: "todo", dueDate: today }, today)).toBe("Today");
    expect(dueBadge({ status: "todo", dueDate: "2026-07-24" }, today)).toBe(
      "Tomorrow",
    );
  });
});
