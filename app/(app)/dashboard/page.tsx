"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, type ApiTask } from "@/lib/client";
import { AppHeader } from "@/components/shell/AppHeader";
import { PageBlock, PageEnter } from "@/components/ui/PageEnter";
import { StatPill } from "@/components/dashboard/StatPill";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { OverdueCallout } from "@/components/dashboard/OverdueCallout";
import { TaskList } from "@/components/tasks/TaskList";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";

type Dashboard = {
  today: string;
  streak: number;
  goalPercent: number;
  goalDone: number;
  goalTotal: number;
  estimateMinutes: number;
  buckets: Record<string, number>;
  moduleProgress: {
    module: string;
    done: number;
    total: number;
    percent: number;
  }[];
  todayTasks: ApiTask[];
  overdueTasks: ApiTask[];
};

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const d = await api<Dashboard>("/api/dashboard");
      setData(d);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    void load();
    const onChange = () => void load();
    window.addEventListener("switchup:tasks-changed", onChange);
    return () => window.removeEventListener("switchup:tasks-changed", onChange);
  }, [load]);

  if (error) {
    return (
      <EmptyState
        title="Studio is napping"
        body={error}
        actionLabel="Retry"
        onAction={() => void load()}
      />
    );
  }

  if (!data) {
    return <p className="text-ink-soft">Warming the paper desk…</p>;
  }

  return (
    <PageEnter>
      <PageBlock>
        <AppHeader
          title="Dashboard"
          subtitle="A gentle snapshot of today’s prep — streak, focus, and soft overdue nudges."
          action={
            <Link
              href="/today"
              className="rounded-2xl bg-matcha px-4 py-2.5 text-sm font-semibold text-cream shadow-[0_4px_0_var(--matcha-deep)]"
            >
              Open Today
            </Link>
          }
        />
      </PageBlock>

      <PageBlock>
        <OverdueCallout tasks={data.overdueTasks} />
      </PageBlock>

      <PageBlock className="flex flex-wrap items-center gap-6">
        <div className="paper-card flex items-center gap-5 p-5">
          <ProgressRing percent={data.goalPercent} label="today" />
          <div>
            <p className="font-display text-2xl">Daily goal</p>
            <p className="text-sm text-ink-soft">
              {data.goalDone}/{data.goalTotal} done · ~{data.estimateMinutes}m
              left
            </p>
          </div>
        </div>
        <div className="flex flex-1 flex-wrap gap-3">
          <StatPill label="Streak" value={`${data.streak}d`} tone="butter" />
          <StatPill
            label="Overdue"
            value={data.buckets.overdue}
            tone="peach"
          />
          <StatPill
            label="Today"
            value={data.buckets.today}
            tone="matcha"
          />
          <StatPill
            label="Later"
            value={data.buckets.later}
            tone="lavender"
          />
        </div>
      </PageBlock>

      <PageBlock>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-2xl">Module progress</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.moduleProgress.map((m) => (
            <Chip key={m.module} tone="paper" className="px-3 py-2 text-sm">
              {m.module} · {m.percent}%
            </Chip>
          ))}
        </div>
      </PageBlock>

      <PageBlock>
        <h2 className="mb-3 font-display text-2xl">Today’s top tasks</h2>
        <TaskList
          tasks={data.todayTasks}
          today={data.today}
          onChanged={load}
          emptyTitle="Today is wide open"
          emptyBody="Quick-add with N, or seed starter roadmaps in Settings."
        />
      </PageBlock>
    </PageEnter>
  );
}
