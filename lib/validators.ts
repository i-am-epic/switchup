import { z } from "zod";

export const moduleEnum = z.enum([
  "leetcode",
  "backend",
  "ai",
  "azure",
  "projects",
  "articles",
  "notes",
  "interview",
  "general",
]);

export const taskStatusEnum = z.enum(["todo", "doing", "done"]);
export const priorityEnum = z.enum(["low", "medium", "high"]);

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
  .nullable()
  .optional();

export const createTaskSchema = z.object({
  title: z.string().min(1).max(300),
  notes: z.string().max(5000).nullable().optional(),
  status: taskStatusEnum.optional(),
  priority: priorityEnum.optional(),
  module: moduleEnum.optional(),
  topic: z.string().max(120).nullable().optional(),
  dueDate: dateOnly,
  scheduledFor: dateOnly,
  estimateMinutes: z.number().int().min(0).max(24 * 60).nullable().optional(),
  tags: z.array(z.string()).optional(),
  order: z.number().int().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  title: z.string().min(1).max(300).optional(),
});

export const snoozeSchema = z.union([
  z.object({ days: z.number().int().min(1).max(60) }),
  z.object({ until: z.literal("next_monday") }),
]);

export const loginSchema = z.object({
  password: z.string().min(1),
});

export const projectSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).nullable().optional(),
  order: z.number().int().optional(),
});

export const articleSchema = z.object({
  title: z.string().min(1).max(300),
  source: z.string().min(1).max(120),
  url: z.string().min(1).url(),
  mustRead: z.boolean().optional(),
  readAt: z.string().datetime().nullable().optional(),
  revisionDate: dateOnly,
  notes: z.string().max(5000).nullable().optional(),
});

export const noteSchema = z.object({
  title: z.string().min(1).max(300),
  markdown: z.string().max(100_000).optional(),
  revisionDate: dateOnly,
  module: moduleEnum.nullable().optional(),
});

export const interviewSchema = z.object({
  company: z.string().min(1).max(120),
  status: z
    .enum([
      "researching",
      "preparing",
      "applied",
      "interviewing",
      "offer",
      "rejected",
      "withdrawn",
    ])
    .optional(),
  dsaPercent: z.number().int().min(0).max(100).optional(),
  systemDesignPercent: z.number().int().min(0).max(100).optional(),
  behavioralPercent: z.number().int().min(0).max(100).optional(),
  resumeDone: z.boolean().optional(),
  etaDays: z.number().int().min(0).max(365).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
});
