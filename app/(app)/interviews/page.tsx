"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";
import { AppHeader } from "@/components/shell/AppHeader";
import { PageBlock, PageEnter } from "@/components/ui/PageEnter";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";

type Interview = {
  id: string;
  company: string;
  status: string;
  dsaPercent: number;
  systemDesignPercent: number;
  behavioralPercent: number;
  resumeDone: boolean;
  etaDays: number | null;
  notes: string | null;
};

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-semibold text-ink-soft">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-paper-deep">
        <div
          className="h-full rounded-full bg-lavender"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function InterviewsPage() {
  const [items, setItems] = useState<Interview[]>([]);
  const [company, setCompany] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await api<{ interviews: Interview[] }>("/api/interviews");
      setItems(data.interviews);
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
    await api("/api/interviews", {
      method: "POST",
      body: JSON.stringify({ company }),
    });
    setCompany("");
    await load();
  }

  async function bump(id: string, field: string, value: number) {
    await api(`/api/interviews/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ [field]: value }),
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
          title="Interviews"
          subtitle="Company cards with DSA, system design, and behavioral readiness bars."
        />
      </PageBlock>
      <PageBlock>
        <form onSubmit={add} className="flex flex-wrap gap-2">
          <Input
            className="max-w-xs"
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
          <Button type="submit">Track company</Button>
        </form>
      </PageBlock>
      <PageBlock className="grid gap-4 md:grid-cols-2">
        {items.length === 0 ? (
          <EmptyState
            title="No interviews tracked"
            body="Add a company to watch readiness grow."
          />
        ) : (
          items.map((i) => (
            <article key={i.id} className="paper-card space-y-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-2xl">{i.company}</h2>
                <Chip tone="butter">{i.status}</Chip>
              </div>
              <Bar label="DSA" value={i.dsaPercent} />
              <Bar label="System design" value={i.systemDesignPercent} />
              <Bar label="Behavioral" value={i.behavioralPercent} />
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  size="sm"
                  variant="soft"
                  onClick={() =>
                    void bump(i.id, "dsaPercent", Math.min(100, i.dsaPercent + 5))
                  }
                >
                  DSA +5
                </Button>
                <Button
                  size="sm"
                  variant="soft"
                  onClick={() =>
                    void bump(
                      i.id,
                      "systemDesignPercent",
                      Math.min(100, i.systemDesignPercent + 5),
                    )
                  }
                >
                  Design +5
                </Button>
                <Button
                  size="sm"
                  variant="soft"
                  onClick={() =>
                    void bump(
                      i.id,
                      "behavioralPercent",
                      Math.min(100, i.behavioralPercent + 5),
                    )
                  }
                >
                  Behavioral +5
                </Button>
              </div>
              {i.etaDays != null ? (
                <p className="text-xs text-ink-soft">ETA ~{i.etaDays} days</p>
              ) : null}
            </article>
          ))
        )}
      </PageBlock>
    </PageEnter>
  );
}
