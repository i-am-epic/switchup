import type { Module, Prisma, Task } from "@prisma/client";
import { prisma } from "./prisma";
import { getToday, parseDateOnly, toDateOnly, toZonedDateOnly } from "./dates";
import { classifyTask, type ReminderBucket } from "./reminders";
import { computeStreak } from "./streak";

export function serializeTask(task: Task) {
  return {
    ...task,
    dueDate: toDateOnly(task.dueDate),
    scheduledFor: toDateOnly(task.scheduledFor),
    completedAt: task.completedAt?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export async function listTasks(opts: {
  view?: string | null;
  module?: string | null;
  status?: string | null;
}) {
  const today = getToday();
  const where: Prisma.TaskWhereInput = {};
  if (opts.module) where.module = opts.module as Module;
  if (opts.status) where.status = opts.status as Task["status"];

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  if (!opts.view || opts.view === "all") {
    return tasks.map(serializeTask);
  }

  const filtered = tasks.filter((t) => {
    const bucket = classifyTask(t, today);
    if (opts.view === "today") return bucket === "today";
    if (opts.view === "overdue") return bucket === "overdue";
    if (opts.view === "pending") {
      return bucket === "overdue" || bucket === "pending";
    }
    if (opts.view === "later") return bucket === "later";
    return true;
  });

  return filtered.map(serializeTask);
}

export async function markTaskComplete(task: Task) {
  const today = getToday();
  const wasDone = task.status === "done";

  const updated = await prisma.task.update({
    where: { id: task.id },
    data: {
      status: "done",
      completedAt: task.completedAt ?? new Date(),
    },
  });

  if (!wasDone) {
    await prisma.dailyLog.upsert({
      where: { date: parseDateOnly(today) },
      create: {
        date: parseDateOnly(today),
        tasksCompleted: 1,
        studyMinutes: task.estimateMinutes ?? 0,
      },
      update: {
        tasksCompleted: { increment: 1 },
        studyMinutes: { increment: task.estimateMinutes ?? 0 },
      },
    });
  }

  return updated;
}

export async function getDashboard() {
  const today = getToday();
  const tasks = await prisma.task.findMany();
  const buckets: Record<ReminderBucket, number> = {
    overdue: 0,
    today: 0,
    pending: 0,
    later: 0,
    unscheduled: 0,
  };

  for (const t of tasks) {
    if (t.status === "done") continue;
    buckets[classifyTask(t, today)] += 1;
  }

  const modules: Module[] = [
    "leetcode",
    "backend",
    "ai",
    "azure",
    "projects",
  ];

  const moduleProgress = modules.map((module) => {
    const subset = tasks.filter((t) => t.module === module);
    const done = subset.filter((t) => t.status === "done").length;
    const total = subset.length;
    return {
      module,
      done,
      total,
      percent: total === 0 ? 0 : Math.round((done / total) * 100),
    };
  });

  const openToday = tasks.filter(
    (t) => t.status !== "done" && classifyTask(t, today) === "today",
  );
  const doneToday = tasks.filter(
    (t) =>
      t.status === "done" &&
      t.completedAt &&
      toZonedDateOnly(t.completedAt) === today,
  );

  const goalTotal = openToday.length + doneToday.length;
  const goalDone = doneToday.length;
  const goalPercent =
    goalTotal === 0 ? 0 : Math.round((goalDone / goalTotal) * 100);

  const estimateMinutes = openToday.reduce(
    (sum, t) => sum + (t.estimateMinutes ?? 0),
    0,
  );

  const logs = await prisma.dailyLog.findMany({
    orderBy: { date: "desc" },
    take: 60,
  });
  const streak = computeStreak(
    logs.map((l) => ({
      date: toDateOnly(l.date)!,
      tasksCompleted: l.tasksCompleted,
    })),
    today,
  );

  const todayTasks = openToday.slice(0, 8).map(serializeTask);
  const overdueTasks = tasks
    .filter((t) => classifyTask(t, today) === "overdue")
    .slice(0, 5)
    .map(serializeTask);

  return {
    today,
    streak,
    goalPercent,
    goalDone,
    goalTotal,
    estimateMinutes,
    buckets,
    moduleProgress,
    todayTasks,
    overdueTasks,
  };
}

export async function moduleTopicProgress(module: Module) {
  const topics = await prisma.roadmapTopic.findMany({
    where: { module },
    orderBy: { order: "asc" },
  });
  const tasks = await prisma.task.findMany({ where: { module } });

  return topics.map((topic) => {
    const subset = tasks.filter((t) => t.topic === topic.name);
    const done = subset.filter((t) => t.status === "done").length;
    const total = subset.length;
    return {
      ...topic,
      done,
      total,
      percent: total === 0 ? 0 : Math.round((done / total) * 100),
      tasks: subset.map(serializeTask),
    };
  });
}
