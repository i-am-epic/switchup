export type StreakLog = {
  date: string | Date;
  tasksCompleted: number;
};

function toYmd(value: string | Date): string {
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

/** Consecutive calendar days ending at `today` with tasksCompleted > 0 */
export function computeStreak(logs: StreakLog[], today: string): number {
  const active = new Set(
    logs
      .filter((l) => l.tasksCompleted > 0)
      .map((l) => toYmd(l.date)),
  );

  let streak = 0;
  let cursor = today;

  while (active.has(cursor)) {
    streak += 1;
    const d = new Date(`${cursor}T00:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() - 1);
    cursor = d.toISOString().slice(0, 10);
  }

  return streak;
}
