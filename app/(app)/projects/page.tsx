"use client";

import { useCallback, useEffect, useState } from "react";
import { api, type ApiTask } from "@/lib/client";
import { getToday } from "@/lib/dates";
import { AppHeader } from "@/components/shell/AppHeader";
import { PageBlock, PageEnter } from "@/components/ui/PageEnter";
import { TaskList } from "@/components/tasks/TaskList";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

type Project = {
  id: string;
  name: string;
  description: string | null;
  done: number;
  total: number;
  percent: number;
  tasks: ApiTask[];
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [taskTitle, setTaskTitle] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const today = getToday();

  const load = useCallback(async () => {
    try {
      const data = await api<{ projects: Project[] }>("/api/projects");
      setProjects(data.projects);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function addProject(e: React.FormEvent) {
    e.preventDefault();
    await api("/api/projects", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    setName("");
    await load();
  }

  async function addTask(projectName: string) {
    const title = taskTitle[projectName]?.trim();
    if (!title) return;
    await api("/api/tasks", {
      method: "POST",
      body: JSON.stringify({
        title,
        module: "projects",
        topic: projectName,
        scheduledFor: today,
      }),
    });
    setTaskTitle((prev) => ({ ...prev, [projectName]: "" }));
    await load();
  }

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
          title="Projects"
          subtitle="Named projects with nested checklists — progress from real tasks."
        />
      </PageBlock>
      <PageBlock>
        <form onSubmit={addProject} className="flex flex-wrap gap-2">
          <Input
            className="max-w-xs"
            placeholder="New project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Button type="submit">Add project</Button>
        </form>
      </PageBlock>
      <PageBlock className="space-y-6">
        {projects.length === 0 ? (
          <EmptyState
            title="No projects"
            body="Seed Career OS or create a project to hold checklist items."
          />
        ) : (
          projects.map((p) => (
            <section key={p.id} className="paper-card space-y-4 p-5">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="font-display text-2xl">{p.name}</h2>
                  {p.description ? (
                    <p className="text-sm text-ink-soft">{p.description}</p>
                  ) : null}
                </div>
                <p className="text-sm font-semibold text-ink-soft">
                  {p.done}/{p.total} · {p.percent}%
                </p>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-paper-deep">
                <div
                  className="h-full rounded-full bg-matcha"
                  style={{ width: `${p.percent}%` }}
                />
              </div>
              <TaskList tasks={p.tasks} today={today} onChanged={load} />
              <div className="flex flex-wrap gap-2">
                <Input
                  className="max-w-sm"
                  placeholder="Add checklist item"
                  value={taskTitle[p.name] ?? ""}
                  onChange={(e) =>
                    setTaskTitle((prev) => ({
                      ...prev,
                      [p.name]: e.target.value,
                    }))
                  }
                />
                <Button
                  type="button"
                  variant="soft"
                  onClick={() => void addTask(p.name)}
                >
                  Add task
                </Button>
              </div>
            </section>
          ))
        )}
      </PageBlock>
    </PageEnter>
  );
}
