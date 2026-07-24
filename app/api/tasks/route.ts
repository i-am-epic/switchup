import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unauthorizedIfNeeded, jsonError } from "@/lib/api";
import { listTasks, serializeTask, markTaskComplete } from "@/lib/tasks";
import { createTaskSchema } from "@/lib/validators";
import { parseDateOnly } from "@/lib/dates";

export async function GET(request: Request) {
  const denied = await unauthorizedIfNeeded();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const tasks = await listTasks({
    view: searchParams.get("view"),
    module: searchParams.get("module"),
    status: searchParams.get("status"),
  });
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const denied = await unauthorizedIfNeeded();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid task");
  }

  const data = parsed.data;
  const task = await prisma.task.create({
    data: {
      title: data.title,
      notes: data.notes ?? undefined,
      status: data.status,
      priority: data.priority,
      module: data.module,
      topic: data.topic ?? undefined,
      dueDate: data.dueDate ? parseDateOnly(data.dueDate) : undefined,
      scheduledFor: data.scheduledFor
        ? parseDateOnly(data.scheduledFor)
        : undefined,
      estimateMinutes: data.estimateMinutes ?? undefined,
      tags: data.tags,
      order: data.order,
    },
  });

  if (task.status === "done") {
    await markTaskComplete(task);
    const refreshed = await prisma.task.findUniqueOrThrow({
      where: { id: task.id },
    });
    return NextResponse.json({ task: serializeTask(refreshed) }, { status: 201 });
  }

  return NextResponse.json({ task: serializeTask(task) }, { status: 201 });
}
