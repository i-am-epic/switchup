"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";
import { AppHeader } from "@/components/shell/AppHeader";
import { PageBlock, PageEnter } from "@/components/ui/PageEnter";
import { Checkbox } from "@/components/ui/Checkbox";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";

type Article = {
  id: string;
  title: string;
  source: string;
  url: string;
  mustRead: boolean;
  readAt: string | null;
  revisionDate: string | null;
  notes: string | null;
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await api<{ articles: Article[] }>("/api/articles");
      setArticles(data.articles);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await api("/api/articles", {
      method: "POST",
      body: JSON.stringify({ title, source, url, mustRead: true }),
    });
    setTitle("");
    setSource("");
    setUrl("");
    await load();
  }

  async function toggleRead(article: Article, next: boolean) {
    await api(`/api/articles/${article.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        readAt: next ? new Date().toISOString() : null,
      }),
    });
    await load();
  }

  if (error) {
    return (
      <EmptyState
        title="Studio is napping"
        body={error}
        actionLabel="Retry"
        onAction={() => void load()}
      />
    );
  }

  return (
    <PageEnter>
      <PageBlock>
        <AppHeader
          title="Articles"
          subtitle="Must-reads with a checkbox for done and a revision date when you want one."
        />
      </PageBlock>
      <PageBlock>
        <form onSubmit={add} className="paper-card grid gap-3 p-5 md:grid-cols-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            placeholder="Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            required
          />
          <Input
            placeholder="https://…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <Button type="submit">Add article</Button>
        </form>
      </PageBlock>
      <PageBlock className="space-y-3">
        {articles.length === 0 ? (
          <EmptyState
            title="No articles yet"
            body="Seed the studio or paste a must-read above."
          />
        ) : (
          articles.map((a) => (
            <div
              key={a.id}
              className="flex items-start gap-3 rounded-2xl border border-[var(--line)] bg-cream/70 px-4 py-3"
            >
              <Checkbox
                checked={Boolean(a.readAt)}
                onChange={(next) => void toggleRead(a, next)}
                label={a.title}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-ink underline decoration-matcha/50 underline-offset-4"
                  >
                    {a.title}
                  </a>
                  {a.mustRead ? <Chip tone="peach">must-read</Chip> : null}
                  <Chip tone="paper">{a.source}</Chip>
                </div>
                {a.revisionDate ? (
                  <p className="mt-1 text-xs text-ink-soft">
                    Revise by {a.revisionDate}
                  </p>
                ) : null}
              </div>
            </div>
          ))
        )}
      </PageBlock>
    </PageEnter>
  );
}
