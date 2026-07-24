"use client";

import { AnimatePresence, motion } from "framer-motion";
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
      {topics.map((topic, i) => {
        const complete = topic.total > 0 && topic.percent === 100;
        return (
          <motion.section
            key={topic.id}
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut", delay: i * 0.04 }}
            className="paper-card space-y-4 p-5"
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 font-display text-2xl">
                  {topic.name}
                  <AnimatePresence>
                    {complete ? (
                      <motion.span
                        key="done"
                        className="pop-in rounded-full bg-matcha px-2 py-0.5 text-xs font-bold text-cream shadow-[0_4px_0_var(--matcha-deep)]"
                      >
                        ✓ Done
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </h3>
                {topic.description ? (
                  <p className="text-sm text-ink-soft">{topic.description}</p>
                ) : null}
              </div>
              <p className="text-sm font-semibold text-ink-soft tabular-nums">
                {topic.done}/{topic.total} · {topic.percent}%
              </p>
            </div>
            <div className="progress-track h-3 rounded-full bg-paper-deep">
              <motion.div
                className={`progress-fill h-full rounded-full ${
                  complete ? "is-complete" : ""
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${topic.percent}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
            <TaskList
              tasks={topic.tasks}
              today={today}
              onChanged={onChanged}
              emptyTitle={`No ${topic.name} tasks`}
              emptyBody="Seed the roadmap or add a checklist item."
            />
          </motion.section>
        );
      })}
    </div>
  );
}
