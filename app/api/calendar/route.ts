import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unauthorizedIfNeeded, jsonError } from "@/lib/api";
import { parseDateOnly, toDateOnly } from "@/lib/dates";

export async function GET(request: Request) {
  const denied = await unauthorizedIfNeeded();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return jsonError("from and to (YYYY-MM-DD) are required");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return jsonError("Invalid date format");
  }

  const logs = await prisma.dailyLog.findMany({
    where: {
      date: {
        gte: parseDateOnly(from),
        lte: parseDateOnly(to),
      },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({
    logs: logs.map((l) => ({
      date: toDateOnly(l.date),
      studyMinutes: l.studyMinutes,
      tasksCompleted: l.tasksCompleted,
    })),
  });
}
