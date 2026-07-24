import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unauthorizedIfNeeded, jsonError } from "@/lib/api";
import { interviewSchema } from "@/lib/validators";

function serializeInterview(i: {
  id: string;
  company: string;
  status: string;
  dsaPercent: number;
  systemDesignPercent: number;
  behavioralPercent: number;
  resumeDone: boolean;
  etaDays: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...i,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  };
}

export async function GET() {
  const denied = await unauthorizedIfNeeded();
  if (denied) return denied;

  const interviews = await prisma.interview.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({
    interviews: interviews.map(serializeInterview),
  });
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

  const parsed = interviewSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid interview");
  }

  const data = parsed.data;
  const interview = await prisma.interview.create({
    data: {
      company: data.company,
      status: data.status,
      dsaPercent: data.dsaPercent,
      systemDesignPercent: data.systemDesignPercent,
      behavioralPercent: data.behavioralPercent,
      resumeDone: data.resumeDone,
      etaDays: data.etaDays ?? undefined,
      notes: data.notes ?? undefined,
    },
  });

  return NextResponse.json(
    { interview: serializeInterview(interview) },
    { status: 201 },
  );
}
