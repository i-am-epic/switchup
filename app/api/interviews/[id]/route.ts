import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unauthorizedIfNeeded, jsonError } from "@/lib/api";
import { interviewSchema } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  const denied = await unauthorizedIfNeeded();
  if (denied) return denied;

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const parsed = interviewSchema.partial().safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid interview");
  }

  const data = parsed.data;
  try {
    const interview = await prisma.interview.update({
      where: { id },
      data: {
        company: data.company,
        status: data.status,
        dsaPercent: data.dsaPercent,
        systemDesignPercent: data.systemDesignPercent,
        behavioralPercent: data.behavioralPercent,
        resumeDone: data.resumeDone,
        etaDays: data.etaDays === undefined ? undefined : data.etaDays,
        notes: data.notes === undefined ? undefined : data.notes,
      },
    });
    return NextResponse.json({
      interview: {
        ...interview,
        createdAt: interview.createdAt.toISOString(),
        updatedAt: interview.updatedAt.toISOString(),
      },
    });
  } catch {
    return jsonError("Interview not found", 404);
  }
}

export async function DELETE(_request: Request, context: Ctx) {
  const denied = await unauthorizedIfNeeded();
  if (denied) return denied;

  const { id } = await context.params;
  try {
    await prisma.interview.delete({ where: { id } });
  } catch {
    return jsonError("Interview not found", 404);
  }
  return NextResponse.json({ ok: true });
}
