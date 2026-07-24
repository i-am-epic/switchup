import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unauthorizedIfNeeded, jsonError } from "@/lib/api";
import { noteSchema } from "@/lib/validators";
import { parseDateOnly, toDateOnly } from "@/lib/dates";

function serializeNote(n: {
  id: string;
  title: string;
  markdown: string;
  revisionDate: Date | null;
  module: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...n,
    revisionDate: toDateOnly(n.revisionDate),
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  };
}

export async function GET() {
  const denied = await unauthorizedIfNeeded();
  if (denied) return denied;

  const notes = await prisma.note.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ notes: notes.map(serializeNote) });
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

  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid note");
  }

  const data = parsed.data;
  const note = await prisma.note.create({
    data: {
      title: data.title,
      markdown: data.markdown ?? "",
      revisionDate: data.revisionDate
        ? parseDateOnly(data.revisionDate)
        : undefined,
      module: data.module ?? undefined,
    },
  });

  return NextResponse.json({ note: serializeNote(note) }, { status: 201 });
}
