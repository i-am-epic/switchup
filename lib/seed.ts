import type { Module, PrismaClient } from "@prisma/client";
import { parseDateOnly, getToday } from "./dates";

type TopicSeed = { module: Module; name: string; description?: string; tasks: string[] };

const TOPICS: TopicSeed[] = [
  {
    module: "leetcode",
    name: "Arrays",
    tasks: ["Two Sum", "Best Time to Buy/Sell Stock", "Product of Array Except Self"],
  },
  {
    module: "leetcode",
    name: "Strings",
    tasks: ["Valid Anagram", "Longest Substring Without Repeating"],
  },
  {
    module: "leetcode",
    name: "Trees",
    tasks: ["Invert Binary Tree", "Level Order Traversal"],
  },
  {
    module: "leetcode",
    name: "DP",
    tasks: ["Climbing Stairs", "House Robber", "Coin Change"],
  },
  {
    module: "leetcode",
    name: "Graphs",
    tasks: ["Number of Islands", "Course Schedule"],
  },
  {
    module: "backend",
    name: "Networking",
    tasks: ["Read TCP/HTTP basics", "Practice DNS & TLS", "Revise load balancing"],
  },
  {
    module: "backend",
    name: "Authentication",
    tasks: ["Read JWT vs sessions", "Practice OAuth flow", "Build auth middleware"],
  },
  {
    module: "backend",
    name: "Caching",
    tasks: ["Read cache strategies", "Practice cache invalidation", "Build a cache layer"],
  },
  {
    module: "backend",
    name: "Redis",
    tasks: ["Read Redis basics", "Watch caching patterns", "Practice Pub/Sub", "Build Redis cache", "Revise Redis"],
  },
  {
    module: "backend",
    name: "Docker",
    tasks: ["Read Docker fundamentals", "Practice Dockerfile", "Build multi-stage image"],
  },
  {
    module: "backend",
    name: "Kafka",
    tasks: ["Read Kafka concepts", "Watch consumer groups", "Practice produce/consume"],
  },
  {
    module: "backend",
    name: "REST",
    tasks: ["Read REST maturity model", "Practice idempotent APIs", "Build versioned endpoints"],
  },
  {
    module: "backend",
    name: "SOLID",
    tasks: ["Read SOLID principles", "Refactor a module with SRP", "Revise design patterns"],
  },
  {
    module: "ai",
    name: "LLMs",
    tasks: ["Read transformer basics", "Compare model tradeoffs", "Revise context windows"],
  },
  {
    module: "ai",
    name: "Embeddings",
    tasks: ["Read embedding spaces", "Practice similarity search", "Build a small index"],
  },
  {
    module: "ai",
    name: "Prompt Engineering",
    tasks: ["Read Anthropic prompt guide", "Practice system prompts", "Build a prompt library"],
  },
  {
    module: "ai",
    name: "RAG",
    tasks: ["Read RAG architecture", "Practice chunking", "Build a mini RAG"],
  },
  {
    module: "ai",
    name: "LangGraph",
    tasks: ["Read LangGraph basics", "Practice agent graph", "Build a research agent"],
  },
  {
    module: "ai",
    name: "MCP",
    tasks: ["Read MCP overview", "Watch tool calling", "Build a tiny MCP tool"],
  },
  {
    module: "ai",
    name: "Evals",
    tasks: ["Read eval frameworks", "Write 5 golden tests"],
  },
  {
    module: "azure",
    name: "Functions",
    tasks: ["Read Azure Functions", "Deploy a hello function"],
  },
  {
    module: "azure",
    name: "Container Apps",
    tasks: ["Read Container Apps", "Deploy a sample API"],
  },
  {
    module: "azure",
    name: "Key Vault",
    tasks: ["Read Key Vault", "Practice secret access"],
  },
  {
    module: "azure",
    name: "Cosmos",
    tasks: ["Read Cosmos DB models", "Practice partition keys"],
  },
  {
    module: "azure",
    name: "AKS",
    tasks: ["Read AKS fundamentals", "Practice a sample deploy"],
  },
  {
    module: "azure",
    name: "Identity",
    tasks: ["Read Entra ID basics", "Practice app registration"],
  },
];

export async function seedDatabase(prisma: PrismaClient) {
  const today = getToday();

  for (const [index, topic] of TOPICS.entries()) {
    await prisma.roadmapTopic.upsert({
      where: { module_name: { module: topic.module, name: topic.name } },
      create: {
        module: topic.module,
        name: topic.name,
        description: topic.description,
        order: index,
      },
      update: { order: index, description: topic.description },
    });

    for (const [taskIndex, title] of topic.tasks.entries()) {
      const existing = await prisma.task.findFirst({
        where: { module: topic.module, topic: topic.name, title },
      });
      if (!existing) {
        await prisma.task.create({
          data: {
            title,
            module: topic.module,
            topic: topic.name,
            order: taskIndex,
            priority: "medium",
            tags: topic.module === "backend" ? ["checklist"] : [],
          },
        });
      }
    }
  }

  await prisma.project.upsert({
    where: { name: "Career OS" },
    create: {
      name: "Career OS",
      description: "Personal interview prep operating system",
      order: 0,
    },
    update: {},
  });

  const projectTasks = [
    "Polish Dashboard",
    "Ship Today reminders",
    "Seed roadmaps",
    "Add heatmap",
  ];
  for (const [i, title] of projectTasks.entries()) {
    const existing = await prisma.task.findFirst({
      where: { module: "projects", topic: "Career OS", title },
    });
    if (!existing) {
      await prisma.task.create({
        data: {
          title,
          module: "projects",
          topic: "Career OS",
          order: i,
          scheduledFor: i < 2 ? parseDateOnly(today) : undefined,
          estimateMinutes: 45,
        },
      });
    }
  }

  const sampleToday = [
    { title: "Solve LC Two Sum", module: "leetcode" as Module, topic: "Arrays", minutes: 25 },
    { title: "Read Redis Pub/Sub", module: "backend" as Module, topic: "Redis", minutes: 30 },
    { title: "Skim MCP article", module: "ai" as Module, topic: "MCP", minutes: 20 },
  ];

  for (const [i, item] of sampleToday.entries()) {
    const existing = await prisma.task.findFirst({
      where: { title: item.title, scheduledFor: parseDateOnly(today) },
    });
    if (!existing) {
      await prisma.task.create({
        data: {
          title: item.title,
          module: item.module,
          topic: item.topic,
          scheduledFor: parseDateOnly(today),
          dueDate: parseDateOnly(today),
          estimateMinutes: item.minutes,
          order: i,
          priority: i === 0 ? "high" : "medium",
        },
      });
    }
  }

  // One overdue sample so reminders feel real on first open
  const overdueTitle = "Revise Arrays patterns";
  const overdueExisting = await prisma.task.findFirst({ where: { title: overdueTitle } });
  if (!overdueExisting) {
    await prisma.task.create({
      data: {
        title: overdueTitle,
        module: "leetcode",
        topic: "Arrays",
        dueDate: parseDateOnly("2026-07-20"),
        scheduledFor: parseDateOnly("2026-07-20"),
        estimateMinutes: 20,
        priority: "high",
      },
    });
  }

  const articleCount = await prisma.article.count();
  if (articleCount === 0) {
    await prisma.article.createMany({
      data: [
        {
          title: "Building effective agents",
          source: "Anthropic",
          url: "https://www.anthropic.com/research/building-effective-agents",
          mustRead: true,
        },
        {
          title: "Context Engineering",
          source: "OpenAI",
          url: "https://openai.com",
          mustRead: true,
        },
      ],
    });
  }

  const noteCount = await prisma.note.count();
  if (noteCount === 0) {
    await prisma.note.create({
      data: {
        title: "Redis Pub/Sub",
        module: "backend",
        markdown:
          "# Pub/Sub\n\nPublisher → channel → Subscriber\n\nUse for fan-out notifications. Not a durable queue.\n",
      },
    });
  }

  const interviewCount = await prisma.interview.count();
  if (interviewCount === 0) {
    await prisma.interview.create({
      data: {
        company: "Google",
        status: "preparing",
        dsaPercent: 55,
        systemDesignPercent: 35,
        behavioralPercent: 40,
        resumeDone: true,
        etaDays: 28,
      },
    });
  }

  return { ok: true, topics: TOPICS.length };
}
