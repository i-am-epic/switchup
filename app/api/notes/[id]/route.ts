import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unauthorizedIfNeeded, jsonError } from "@/lib/api";
import { noteSchema } from "@/lib/validators";
import { parseDateOnly, toDateOnly } from "@/lib/dates";

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

  const parsed = noteSchema.partial().safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid note");
  }

  const data = parsed.data;
  try {
    const note = await prisma.note.update({
      where: { id },
      data: {
        title: data.title,
        markdown: data.markdown,
        revisionDate:
          data.revisionDate === undefined
            ? undefined
            : data.revisionDate === null
              ? null
              : parseDateOnly(data.revisionDate),
        module: data.module === undefined ? undefined : data.module,
      },
    });
    return NextResponse.json({
      note: {
        ...note,
        revisionDate: toDateOnly(note.revisionDate),
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      },
    });
  } catch {
    return jsonError("Note not found", 404);
  }
}

export async function DELETE(_request: Request, context: Ctx) {
  const denied = await unauthorizedIfNeeded();
  if (denied) return denied;

  const { id } = await context.params;
  try {
    await prisma.note.delete({ where: { id } });
  } catch {
    return jsonError("Note not found", 404);
  }
  return NextResponse.json({ ok: true });
}
