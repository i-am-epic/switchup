import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unauthorizedIfNeeded, jsonError } from "@/lib/api";
import { moduleTopicProgress } from "@/lib/tasks";
import type { Module } from "@prisma/client";
import { moduleEnum } from "@/lib/validators";
import { z } from "zod";

export async function GET(request: Request) {
  const denied = await unauthorizedIfNeeded();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const moduleParam = searchParams.get("module");

  if (moduleParam) {
    const parsed = moduleEnum.safeParse(moduleParam);
    if (!parsed.success) return jsonError("Invalid module");
    const topics = await moduleTopicProgress(parsed.data as Module);
    return NextResponse.json({ topics });
  }

  const topics = await prisma.roadmapTopic.findMany({
    orderBy: [{ module: "asc" }, { order: "asc" }],
  });
  return NextResponse.json({ topics });
}

const createTopicSchema = z.object({
  module: moduleEnum,
  name: z.string().min(1).max(120),
  description: z.string().max(500).nullable().optional(),
  order: z.number().int().optional(),
});

export async function POST(request: Request) {
  const denied = await unauthorizedIfNeeded();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const parsed = createTopicSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid topic");
  }

  const topic = await prisma.roadmapTopic.create({
    data: {
      module: parsed.data.module,
      name: parsed.data.name,
      description: parsed.data.description ?? undefined,
      order: parsed.data.order ?? 0,
    },
  });

  return NextResponse.json({ topic }, { status: 201 });
}
