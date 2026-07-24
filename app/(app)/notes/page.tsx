"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";
import { AppHeader } from "@/components/shell/AppHeader";
import { PageBlock, PageEnter } from "@/components/ui/PageEnter";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Chip } from "@/components/ui/Chip";

type Note = {
  id: string;
  title: string;
  markdown: string;
  revisionDate: string | null;
  module: string | null;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await api<{ notes: Note[] }>("/api/notes");
      setNotes(data.notes);
      setError("");
      if (!selectedId && data.notes[0]) {
        setSelectedId(data.notes[0].id);
        setTitle(data.notes[0].title);
        setMarkdown(data.notes[0].markdown);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }, [selectedId]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function select(note: Note) {
    setSelectedId(note.id);
    setTitle(note.title);
    setMarkdown(note.markdown);
  }

  async function create() {
    const data = await api<{ note: Note }>("/api/notes", {
      method: "POST",
      body: JSON.stringify({ title: "Untitled note", markdown: "" }),
    });
    await load();
    select(data.note);
  }

  async function save() {
    if (!selectedId) return;
    await api(`/api/notes/${selectedId}`, {
      method: "PATCH",
      body: JSON.stringify({ title, markdown }),
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
          title="Notes"
          subtitle="A soft markdown notepad for patterns, prompts, and revision dates."
          action={<Button onClick={() => void create()}>New note</Button>}
        />
      </PageBlock>
      <PageBlock className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <div className="space-y-2">
          {notes.length === 0 ? (
            <EmptyState
              title="No notes"
              body="Start a page for Redis, RAG, or behavioral stories."
              actionLabel="New note"
              onAction={() => void create()}
            />
          ) : (
            notes.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => select(n)}
                className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                  selectedId === n.id
                    ? "border-matcha bg-matcha/15"
                    : "border-[var(--line)] bg-cream/70 hover:bg-cream"
                }`}
              >
                <p className="font-semibold">{n.title}</p>
                {n.module ? (
                  <Chip tone="paper" className="mt-2">
                    {n.module}
                  </Chip>
                ) : null}
              </button>
            ))
          )}
        </div>
        {selectedId ? (
          <div className="paper-card space-y-3 p-5">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea
              rows={16}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="# Heading&#10;&#10;Write freely…"
              className="font-mono text-sm"
            />
            <Button onClick={() => void save()}>Save note</Button>
          </div>
        ) : null}
      </PageBlock>
    </PageEnter>
  );
}
