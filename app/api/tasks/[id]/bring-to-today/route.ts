import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unauthorizedIfNeeded, jsonError } from "@/lib/api";
import { serializeTask } from "@/lib/tasks";
import { getToday, parseDateOnly } from "@/lib/dates";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Ctx) {
  const denied = await unauthorizedIfNeeded();
  if (denied) return denied;

  const { id } = await context.params;
  const today = getToday();

  try {
    const task = await prisma.task.update({
      where: { id },
      data: { scheduledFor: parseDateOnly(today) },
    });
    return NextResponse.json({ task: serializeTask(task) });
  } catch {
    return jsonError("Task not found", 404);
  }
}
