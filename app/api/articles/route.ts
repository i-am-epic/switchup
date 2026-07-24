import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unauthorizedIfNeeded, jsonError } from "@/lib/api";
import { articleSchema } from "@/lib/validators";
import { parseDateOnly, toDateOnly } from "@/lib/dates";

function serializeArticle(a: {
  id: string;
  title: string;
  source: string;
  url: string;
  mustRead: boolean;
  readAt: Date | null;
  revisionDate: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...a,
    readAt: a.readAt?.toISOString() ?? null,
    revisionDate: toDateOnly(a.revisionDate),
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

export async function GET() {
  const denied = await unauthorizedIfNeeded();
  if (denied) return denied;

  const articles = await prisma.article.findMany({
    orderBy: [{ mustRead: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ articles: articles.map(serializeArticle) });
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

  const parsed = articleSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid article");
  }

  const data = parsed.data;
  const article = await prisma.article.create({
    data: {
      title: data.title,
      source: data.source,
      url: data.url,
      mustRead: data.mustRead ?? false,
      readAt: data.readAt ? new Date(data.readAt) : undefined,
      revisionDate: data.revisionDate
        ? parseDateOnly(data.revisionDate)
        : undefined,
      notes: data.notes ?? undefined,
    },
  });

  return NextResponse.json(
    { article: serializeArticle(article) },
    { status: 201 },
  );
}
