"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, type ApiTask } from "@/lib/client";
import { classifyTask, sortNeedsAttention } from "@/lib/reminders";
import { getToday } from "@/lib/dates";
import { AppHeader } from "@/components/shell/AppHeader";
import { PageBlock, PageEnter } from "@/components/ui/PageEnter";
import { TaskList } from "@/components/tasks/TaskList";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function TodayPage() {
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [focus, setFocus] = useState(false);
  const [error, setError] = useState("");
  const today = getToday();

  const load = useCallback(async () => {
    try {
      const data = await api<{ tasks: ApiTask[] }>("/api/tasks?view=all");
      setTasks(data.tasks);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }, []);

  useEffect(() => {
    void load();
    const onChange = () => void load();
    window.addEventListener("career-os:tasks-changed", onChange);
    return () => window.removeEventListener("career-os:tasks-changed", onChange);
  }, [load]);

  const { needs, todayTasks, laterTasks, minutes } = useMemo(() => {
    const open = tasks.filter((t) => t.status !== "done");
    const needs = sortNeedsAttention(open, today);
    let todayTasks = open.filter((t) => classifyTask(t, today) === "today");
    const laterTasks = open.filter((t) => classifyTask(t, today) === "later");
    if (focus) {
      todayTasks = todayTasks.slice(0, 5);
    }
    const minutes = todayTasks.reduce(
      (s, t) => s + (t.estimateMinutes ?? 0),
      0,
    );
    return { needs, todayTasks, laterTasks, minutes };
  }, [tasks, today, focus]);

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

  return (
    <PageEnter>
      <PageBlock>
        <AppHeader
          title="Today"
          subtitle="Needs attention first, then today’s plan, then later — a reminder desk, not a module."
          action={
            <Button
              variant={focus ? "primary" : "soft"}
              onClick={() => setFocus((v) => !v)}
            >
              {focus ? "Focus on" : "Focus mode"}
            </Button>
          }
        />
        <p className="mt-2 text-sm text-ink-soft">
          Expected today: ~{minutes} minutes
          {focus ? " · showing top 5" : ""}
        </p>
      </PageBlock>

      <PageBlock className="space-y-3">
        <h2 className="font-display text-2xl text-peach-deep">
          Needs attention
        </h2>
        <TaskList
          tasks={needs}
          today={today}
          onChanged={load}
          showBringToday
          emptyTitle="All caught up"
          emptyBody="No overdue or older pending tasks. Lovely."
        />
      </PageBlock>

      <PageBlock className="space-y-3">
        <h2 className="font-display text-2xl">Today</h2>
        <TaskList
          tasks={todayTasks}
          today={today}
          onChanged={load}
          emptyTitle="Nothing scheduled"
          emptyBody="Press N to add something gentle for today."
        />
      </PageBlock>

      {!focus ? (
        <PageBlock className="space-y-3">
          <h2 className="font-display text-2xl">Later</h2>
          <TaskList
            tasks={laterTasks}
            today={today}
            onChanged={load}
            emptyTitle="No later tasks"
            emptyBody="Future-you has a clear desk."
          />
        </PageBlock>
      ) : null}
    </PageEnter>
  );
}
