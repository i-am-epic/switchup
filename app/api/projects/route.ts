import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unauthorizedIfNeeded, jsonError } from "@/lib/api";
import { projectSchema } from "@/lib/validators";
import { serializeTask } from "@/lib/tasks";

export async function GET() {
  const denied = await unauthorizedIfNeeded();
  if (denied) return denied;

  const projects = await prisma.project.findMany({ orderBy: { order: "asc" } });
  const tasks = await prisma.task.findMany({ where: { module: "projects" } });

  const enriched = projects.map((p) => {
    const subset = tasks.filter((t) => t.topic === p.name);
    const done = subset.filter((t) => t.status === "done").length;
    const total = subset.length;
    return {
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      done,
      total,
      percent: total === 0 ? 0 : Math.round((done / total) * 100),
      tasks: subset.map(serializeTask),
    };
  });

  return NextResponse.json({ projects: enriched });
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

  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid project");
  }

  try {
    const project = await prisma.project.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? undefined,
        order: parsed.data.order ?? 0,
      },
    });
    return NextResponse.json(
      {
        project: {
          ...project,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
          done: 0,
          total: 0,
          percent: 0,
          tasks: [],
        },
      },
      { status: 201 },
    );
  } catch {
    return jsonError("Project name already exists", 409);
  }
}
