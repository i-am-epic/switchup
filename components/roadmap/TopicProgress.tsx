"use client";

import type { ApiTask } from "@/lib/client";
import { TaskList } from "@/components/tasks/TaskList";

export type TopicWithTasks = {
  id: string;
  name: string;
  description: string | null;
  done: number;
  total: number;
  percent: number;
  tasks: ApiTask[];
};

export function TopicProgress({
  topics,
  today,
  onChanged,
}: {
  topics: TopicWithTasks[];
  today: string;
  onChanged: () => void;
}) {
  return (
    <div className="space-y-6">
      {topics.map((topic) => (
        <section key={topic.id} className="paper-card space-y-4 p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="font-display text-2xl">{topic.name}</h3>
              {topic.description ? (
                <p className="text-sm text-ink-soft">{topic.description}</p>
              ) : null}
            </div>
            <p className="text-sm font-semibold text-ink-soft">
              {topic.done}/{topic.total} · {topic.percent}%
            </p>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-paper-deep">
            <div
              className="h-full rounded-full bg-matcha transition-all"
              style={{ width: `${topic.percent}%` }}
            />
          </div>
          <TaskList
            tasks={topic.tasks}
            today={today}
            onChanged={onChanged}
            emptyTitle={`No ${topic.name} tasks`}
            emptyBody="Seed the roadmap or add a checklist item."
          />
        </section>
      ))}
    </div>
  );
}
