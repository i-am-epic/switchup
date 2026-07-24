export type ApiTask = {
  id: string;
  title: string;
  notes: string | null;
  status: "todo" | "doing" | "done";
  priority: "low" | "medium" | "high";
  module: string;
  topic: string | null;
  dueDate: string | null;
  scheduledFor: string | null;
  estimateMinutes: number | null;
  completedAt: string | null;
  tags: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
};

export async function api<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data?.error === "string" ? data.error : "Request failed",
    );
  }
  return data as T;
}
