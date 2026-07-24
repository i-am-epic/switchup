"use client";

import clsx from "clsx";
import { addDaysToDateOnly, getToday } from "@/lib/dates";

type Log = {
  date: string;
  tasksCompleted: number;
  studyMinutes: number;
};

function level(count: number) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

export function Heatmap({
  logs,
  weeks = 20,
  onSelect,
  selected,
}: {
  logs: Log[];
  weeks?: number;
  onSelect?: (date: string) => void;
  selected?: string | null;
}) {
  const today = getToday();
  const map = new Map(logs.map((l) => [l.date, l]));
  const days = weeks * 7;
  const start = addDaysToDateOnly(today, -(days - 1));

  const cells: string[] = [];
  for (let i = 0; i < days; i += 1) {
    cells.push(addDaysToDateOnly(start, i));
  }

  return (
    <div className="space-y-3">
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: weeks }).map((_, week) => (
          <div key={week} className="grid grid-rows-7 gap-1.5">
            {cells.slice(week * 7, week * 7 + 7).map((date) => {
              const log = map.get(date);
              const lv = level(log?.tasksCompleted ?? 0);
              return (
                <button
                  key={date}
                  type="button"
                  title={`${date}: ${log?.tasksCompleted ?? 0} done`}
                  onClick={() => onSelect?.(date)}
                  className={clsx(
                    "aspect-square rounded-md border transition",
                    selected === date && "ring-2 ring-ink ring-offset-2 ring-offset-paper",
                    lv === 0 && "border-[var(--line)] bg-paper-deep/60",
                    lv === 1 && "border-matcha/20 bg-matcha/25",
                    lv === 2 && "border-matcha/30 bg-matcha/45",
                    lv === 3 && "border-matcha/40 bg-matcha/65",
                    lv === 4 && "border-matcha-deep/50 bg-matcha-deep",
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-xs text-ink-soft">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((lv) => (
          <span
            key={lv}
            className={clsx(
              "h-3 w-3 rounded-sm",
              lv === 0 && "bg-paper-deep",
              lv === 1 && "bg-matcha/25",
              lv === 2 && "bg-matcha/45",
              lv === 3 && "bg-matcha/65",
              lv === 4 && "bg-matcha-deep",
            )}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
