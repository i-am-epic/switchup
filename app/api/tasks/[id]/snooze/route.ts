import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unauthorizedIfNeeded, jsonError } from "@/lib/api";
import { serializeTask } from "@/lib/tasks";
import { snoozeSchema } from "@/lib/validators";
import { getToday, parseDateOnly } from "@/lib/dates";
import { snoozeDates, snoozeUntilNextMonday } from "@/lib/reminders";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Ctx) {
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

  const parsed = snoozeSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Provide { days } or { until: \"next_monday\" }");
  }

  const today = getToday();
  const next =
    "until" in parsed.data
      ? snoozeUntilNextMonday(existing, today)
      : snoozeDates(existing, parsed.data.days, today);

  const task = await prisma.task.update({
    where: { id },
    data: {
      dueDate: parseDateOnly(next.dueDate),
      scheduledFor: parseDateOnly(next.scheduledFor),
    },
  });

  return NextResponse.json({ task: serializeTask(task) });
}
