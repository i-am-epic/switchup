import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unauthorizedIfNeeded, jsonError } from "@/lib/api";
import { serializeTask, markTaskComplete } from "@/lib/tasks";
import { updateTaskSchema } from "@/lib/validators";
import { parseDateOnly } from "@/lib/dates";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  const denied = await unauthorizedIfNeeded();
  if (denied) return denied;

  const { id } = await context.params;
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) return jsonError("Task not found", 404);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const parsed = updateTaskSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid update");
  }

  const data = parsed.data;
  const becomingDone =
    data.status === "done" && existing.status !== "done";

  const task = await prisma.task.update({
    where: { id },
    data: {
      title: data.title,
      notes: data.notes === null ? null : data.notes,
      status: becomingDone ? undefined : data.status,
      priority: data.priority,
      module: data.module,
      topic: data.topic === null ? null : data.topic,
      dueDate:
        data.dueDate === undefined
          ? undefined
          : data.dueDate === null
            ? null
            : parseDateOnly(data.dueDate),
      scheduledFor:
        data.scheduledFor === undefined
          ? undefined
          : data.scheduledFor === null
            ? null
            : parseDateOnly(data.scheduledFor),
      estimateMinutes:
        data.estimateMinutes === undefined
          ? undefined
          : data.estimateMinutes,
      tags: data.tags,
      order: data.order,
      completedAt:
        data.status && data.status !== "done" ? null : undefined,
    },
  });

  if (becomingDone) {
    const completed = await markTaskComplete(task);
    return NextResponse.json({ task: serializeTask(completed) });
  }

  return NextResponse.json({ task: serializeTask(task) });
}

export async function DELETE(_request: Request, context: Ctx) {
  const denied = await unauthorizedIfNeeded();
  if (denied) return denied;

  const { id } = await context.params;
  try {
    await prisma.task.delete({ where: { id } });
  } catch {
    return jsonError("Task not found", 404);
  }
  return NextResponse.json({ ok: true });
}
