import Link from "next/link";
import type { ApiTask } from "@/lib/client";

export function OverdueCallout({ tasks }: { tasks: ApiTask[] }) {
  if (tasks.length === 0) return null;
  return (
    <div className="rounded-[1.5rem] border border-peach/50 bg-peach/25 p-5 shadow-[0_6px_0_rgba(212,132,106,0.25)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-2xl text-ink">Needs a soft nudge</p>
          <p className="text-sm text-ink-soft">
            {tasks.length} overdue task{tasks.length === 1 ? "" : "s"} waiting
          </p>
        </div>
        <Link
          href="/today"
          className="rounded-2xl bg-ink px-4 py-2 text-sm font-semibold text-cream"
        >
          Open Today
        </Link>
      </div>
      <ul className="mt-3 space-y-1 text-sm">
        {tasks.slice(0, 3).map((t) => (
          <li key={t.id} className="text-ink">
            • {t.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
