"use client";

import { useState } from "react";
import type { ApiTask } from "@/lib/client";
import { api } from "@/lib/client";
import { Checkbox } from "@/components/ui/Checkbox";
import { PriorityDot } from "./PriorityDot";
import { DueBadge } from "./DueBadge";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";

export function TaskRow({
  task,
  today,
  onChanged,
  showBringToday,
}: {
  task: ApiTask;
  today: string;
  onChanged: () => void;
  showBringToday?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const done = task.status === "done";

  async function toggle(next: boolean) {
    setBusy(true);
    try {
      await api(`/api/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: next ? "done" : "todo" }),
      });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function snooze(payload: { days: number } | { until: "next_monday" }) {
    setBusy(true);
    try {
      await api(`/api/tasks/${task.id}/snooze`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function bringToday() {
    setBusy(true);
    try {
      await api(`/api/tasks/${task.id}/bring-to-today`, { method: "POST" });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={`group flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-cream/70 px-4 py-3 transition hover:bg-cream ${
        busy ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox checked={done} onChange={toggle} label={task.title} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityDot priority={task.priority} />
            <p
              className={`font-semibold ${
                done ? "text-ink-soft line-through" : "text-ink"
              }`}
            >
              {task.title}
            </p>
            <DueBadge task={task} today={today} />
            {task.module !== "general" ? (
              <Chip tone="paper">{task.module}</Chip>
            ) : null}
            {task.estimateMinutes ? (
              <span className="text-xs text-ink-soft">
                ~{task.estimateMinutes}m
              </span>
            ) : null}
          </div>
          {task.topic ? (
            <p className="mt-1 text-xs text-ink-soft">{task.topic}</p>
          ) : null}
        </div>
      </div>
      {!done ? (
        <div className="flex flex-wrap gap-2 pl-10 opacity-100 md:opacity-0 md:group-hover:opacity-100">
          <Button size="sm" variant="soft" onClick={() => snooze({ days: 1 })}>
            +1 day
          </Button>
          <Button size="sm" variant="soft" onClick={() => snooze({ days: 3 })}>
            +3 days
          </Button>
          <Button
            size="sm"
            variant="soft"
            onClick={() => snooze({ until: "next_monday" })}
          >
            Mon
          </Button>
          {showBringToday ? (
            <Button size="sm" variant="ghost" onClick={bringToday}>
              Bring to today
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
