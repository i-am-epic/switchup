"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";
import { AppHeader } from "@/components/shell/AppHeader";
import { PageBlock, PageEnter } from "@/components/ui/PageEnter";
import { EmptyState } from "@/components/ui/EmptyState";
import { TopicProgress, type TopicWithTasks } from "./TopicProgress";
import { getToday } from "@/lib/dates";

export function ModulePage({
  module,
  title,
  subtitle,
}: {
  module: string;
  title: string;
  subtitle: string;
}) {
  const [topics, setTopics] = useState<TopicWithTasks[]>([]);
  const [error, setError] = useState("");
  const today = getToday();

  const load = useCallback(async () => {
    try {
      const data = await api<{ topics: TopicWithTasks[] }>(
        `/api/topics?module=${module}`,
      );
      setTopics(data.topics);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load");
    }
  }, [module]);

  useEffect(() => {
    void load();
    const onChange = () => void load();
    window.addEventListener("career-os:tasks-changed", onChange);
    return () => window.removeEventListener("career-os:tasks-changed", onChange);
  }, [load]);

  async function seed() {
    await api("/api/seed", { method: "POST" });
    await load();
  }

  return (
    <PageEnter>
      <PageBlock>
        <AppHeader title={title} subtitle={subtitle} />
      </PageBlock>
      <PageBlock>
        {error ? (
          <EmptyState
            title="Studio is napping"
            body={error}
            actionLabel="Retry"
            onAction={() => void load()}
          />
        ) : topics.length === 0 ? (
          <EmptyState
            title="Empty roadmap"
            body="Plant a starter checklist for this module."
            actionLabel="Seed starter roadmap"
            onAction={() => void seed()}
          />
        ) : (
          <TopicProgress topics={topics} today={today} onChanged={load} />
        )}
      </PageBlock>
    </PageEnter>
  );
}
