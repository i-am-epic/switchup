import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unauthorizedIfNeeded, jsonError } from "@/lib/api";
import { projectSchema } from "@/lib/validators";

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

  const parsed = projectSchema.partial().safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid project");
  }

  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        name: parsed.data.name,
        description:
          parsed.data.description === undefined
            ? undefined
            : parsed.data.description,
        order: parsed.data.order,
      },
    });
    return NextResponse.json({
      project: {
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      },
    });
  } catch {
    return jsonError("Project not found", 404);
  }
}

export async function DELETE(_request: Request, context: Ctx) {
  const denied = await unauthorizedIfNeeded();
  if (denied) return denied;

  const { id } = await context.params;
  try {
    await prisma.project.delete({ where: { id } });
  } catch {
    return jsonError("Project not found", 404);
  }
  return NextResponse.json({ ok: true });
}
