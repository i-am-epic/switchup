import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unauthorizedIfNeeded, jsonError } from "@/lib/api";
import { articleSchema } from "@/lib/validators";
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

  const parsed = articleSchema.partial().safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid article");
  }

  const data = parsed.data;
  try {
    const article = await prisma.article.update({
      where: { id },
      data: {
        title: data.title,
        source: data.source,
        url: data.url,
        mustRead: data.mustRead,
        readAt:
          data.readAt === undefined
            ? undefined
            : data.readAt === null
              ? null
              : new Date(data.readAt),
        revisionDate:
          data.revisionDate === undefined
            ? undefined
            : data.revisionDate === null
              ? null
              : parseDateOnly(data.revisionDate),
        notes: data.notes === undefined ? undefined : data.notes,
      },
    });
    return NextResponse.json({
      article: {
        ...article,
        readAt: article.readAt?.toISOString() ?? null,
        revisionDate: toDateOnly(article.revisionDate),
        createdAt: article.createdAt.toISOString(),
        updatedAt: article.updatedAt.toISOString(),
      },
    });
  } catch {
    return jsonError("Article not found", 404);
  }
}

export async function DELETE(_request: Request, context: Ctx) {
  const denied = await unauthorizedIfNeeded();
  if (denied) return denied;

  const { id } = await context.params;
  try {
    await prisma.article.delete({ where: { id } });
  } catch {
    return jsonError("Article not found", 404);
  }
  return NextResponse.json({ ok: true });
}
