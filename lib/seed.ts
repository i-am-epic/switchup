import type { Module, PrismaClient } from "@prisma/client";
import { parseDateOnly, getToday } from "./dates";

type TopicSeed = { module: Module; name: string; description?: string; tasks: string[] };

const TOPICS: TopicSeed[] = [
  // ─────────────────────────────  LeetCode  ─────────────────────────────
  {
    module: "leetcode",
    name: "Arrays & Hashing",
    description: "Two-pointer, prefix sums, and hashmap patterns.",
    tasks: ["Two Sum", "Best Time to Buy/Sell Stock", "Product of Array Except Self", "Contains Duplicate"],
  },
  {
    module: "leetcode",
    name: "Strings",
    description: "Sliding window and character-frequency patterns.",
    tasks: ["Valid Anagram", "Longest Substring Without Repeating", "Group Anagrams"],
  },
  {
    module: "leetcode",
    name: "Trees",
    description: "DFS/BFS traversals and recursion.",
    tasks: ["Invert Binary Tree", "Level Order Traversal", "Validate BST", "Lowest Common Ancestor"],
  },
  {
    module: "leetcode",
    name: "Dynamic Programming",
    description: "Memoization and bottom-up tabulation.",
    tasks: ["Climbing Stairs", "House Robber", "Coin Change", "Longest Increasing Subsequence"],
  },
  {
    module: "leetcode",
    name: "Graphs",
    description: "Traversal, topological sort, and union-find.",
    tasks: ["Number of Islands", "Course Schedule", "Clone Graph"],
  },

  // ───────────────────────────  Backend Engineer  ───────────────────────
  {
    module: "backend",
    name: "Networking & Protocols",
    description: "How bytes travel — the layer every backend rests on.",
    tasks: ["Read TCP vs UDP", "Understand HTTP/1.1 → HTTP/3", "Practice DNS & TLS handshake", "Revise load balancing (L4 vs L7)"],
  },
  {
    module: "backend",
    name: "Databases & Indexing",
    description: "Relational modeling, transactions, and query tuning.",
    tasks: ["Read ACID & isolation levels", "Understand B-tree vs hash indexes", "Practice EXPLAIN ANALYZE", "Revise normalization vs denormalization"],
  },
  {
    module: "backend",
    name: "Caching",
    description: "Cache strategies, invalidation, and layering.",
    tasks: ["Read cache-aside vs write-through", "Practice cache invalidation", "Understand TTL & eviction (LRU/LFU)", "Build a cache layer"],
  },
  {
    module: "backend",
    name: "Redis",
    description: "In-memory data structures, pub/sub, and patterns.",
    tasks: ["Read Redis data types", "Watch caching patterns", "Practice Pub/Sub", "Build a Redis rate limiter", "Revise persistence (RDB/AOF)"],
  },
  {
    module: "backend",
    name: "Message Queues & Kafka",
    description: "Async processing, streaming, and delivery guarantees.",
    tasks: ["Read Kafka concepts (topics/partitions)", "Understand consumer groups & offsets", "Compare at-least-once vs exactly-once", "Practice produce/consume"],
  },
  {
    module: "backend",
    name: "API Design & REST",
    description: "Contracts, versioning, idempotency, and pagination.",
    tasks: ["Read REST maturity model", "Practice idempotent APIs", "Design pagination & filtering", "Compare REST vs gRPC vs GraphQL", "Build versioned endpoints"],
  },
  {
    module: "backend",
    name: "Auth & Security",
    description: "Sessions, tokens, and the OWASP basics.",
    tasks: ["Read JWT vs sessions", "Practice OAuth 2.0 / OIDC flow", "Review OWASP Top 10", "Build auth middleware"],
  },
  {
    module: "backend",
    name: "Concurrency & Scaling",
    description: "Threads, locks, and horizontal scale.",
    tasks: ["Read threads vs async I/O", "Understand locks & deadlocks", "Practice rate limiting", "Revise sharding & replication"],
  },
  {
    module: "backend",
    name: "Observability",
    description: "Logs, metrics, traces — knowing when it breaks.",
    tasks: ["Read the three pillars of observability", "Set up structured logging", "Practice distributed tracing", "Define SLIs / SLOs"],
  },
  {
    module: "backend",
    name: "Containers & Orchestration",
    description: "Docker and Kubernetes fundamentals.",
    tasks: ["Read Docker fundamentals", "Build a multi-stage image", "Understand K8s pods/deployments/services", "Practice a rolling deploy"],
  },
  {
    module: "backend",
    name: "SOLID & Clean Code",
    description: "Principles that keep services maintainable.",
    tasks: ["Read SOLID principles", "Refactor a module with SRP", "Apply dependency inversion", "Revise clean architecture"],
  },

  // ───────────────────────────  AI Engineer  ────────────────────────────
  {
    module: "ai",
    name: "LLM Fundamentals",
    description: "Transformers, tokens, and model tradeoffs.",
    tasks: ["Read transformer & attention basics", "Understand tokenization", "Compare model tradeoffs (size/latency/cost)", "Revise context windows"],
  },
  {
    module: "ai",
    name: "Prompt Engineering",
    description: "System prompts, few-shot, and structured output.",
    tasks: ["Read Anthropic prompt guide", "Practice system prompts", "Learn few-shot & chain-of-thought", "Build a reusable prompt library"],
  },
  {
    module: "ai",
    name: "Embeddings & Vector Search",
    description: "Semantic representation and similarity retrieval.",
    tasks: ["Read embedding spaces", "Compare cosine vs dot-product", "Practice similarity search", "Build a small vector index"],
  },
  {
    module: "ai",
    name: "RAG",
    description: "Retrieval-augmented generation end to end.",
    tasks: ["Read RAG architecture", "Practice chunking strategies", "Add re-ranking", "Build a mini RAG app"],
  },
  {
    module: "ai",
    name: "Agents & Orchestration",
    description: "Tool-using loops and multi-step agents.",
    tasks: ["Read 'Building effective agents'", "Understand the agent loop", "Practice tool/function calling", "Build a research agent"],
  },
  {
    module: "ai",
    name: "MCP",
    description: "Model Context Protocol — tools & resources.",
    tasks: ["Read MCP overview", "Understand tools vs resources", "Build a tiny MCP server", "Connect it to a client"],
  },
  {
    module: "ai",
    name: "Fine-tuning & Adaptation",
    description: "When to fine-tune vs prompt vs RAG.",
    tasks: ["Read fine-tuning vs RAG vs prompting", "Understand LoRA / PEFT", "Prepare a small dataset"],
  },
  {
    module: "ai",
    name: "Evals & Guardrails",
    description: "Measuring quality and keeping models safe.",
    tasks: ["Read eval frameworks", "Write 5 golden tests", "Add an LLM-as-judge eval", "Design input/output guardrails"],
  },

  // ──────────────────────────────  MLOps  ───────────────────────────────
  {
    module: "mlops",
    name: "ML Lifecycle",
    description: "From problem framing to production and back.",
    tasks: ["Read the ML lifecycle end to end", "Map data → train → deploy → monitor", "Understand training/serving skew"],
  },
  {
    module: "mlops",
    name: "Data & Feature Stores",
    description: "Reliable, reusable features across teams.",
    tasks: ["Read feature store concepts (Feast)", "Understand offline vs online features", "Practice data versioning (DVC)"],
  },
  {
    module: "mlops",
    name: "Experiment Tracking",
    description: "Reproducible runs, metrics, and artifacts.",
    tasks: ["Set up MLflow / Weights & Biases", "Track params, metrics, artifacts", "Compare runs & pick a baseline"],
  },
  {
    module: "mlops",
    name: "Training Pipelines",
    description: "Automated, orchestrated training workflows.",
    tasks: ["Read pipeline orchestration (Airflow/Kubeflow)", "Build a reproducible training DAG", "Add data validation steps"],
  },
  {
    module: "mlops",
    name: "Model Registry & Versioning",
    description: "Promote models through stages safely.",
    tasks: ["Understand a model registry", "Practice staging → production promotion", "Tag & roll back model versions"],
  },
  {
    module: "mlops",
    name: "Deployment & Serving",
    description: "Batch, real-time, and streaming inference.",
    tasks: ["Compare batch vs real-time serving", "Practice with BentoML / KServe", "Add canary & shadow deploys", "Optimize latency (batching/quantization)"],
  },
  {
    module: "mlops",
    name: "Monitoring & Drift",
    description: "Catch data drift and model decay early.",
    tasks: ["Read data vs concept drift", "Set up drift detection (Evidently)", "Alert on performance degradation"],
  },
  {
    module: "mlops",
    name: "CI/CD for ML",
    description: "Testing and shipping models like software.",
    tasks: ["Read CI/CD for ML (CT = continuous training)", "Add model tests to a pipeline", "Automate retraining triggers"],
  },
  {
    module: "mlops",
    name: "Infrastructure (GPUs/K8s)",
    description: "Compute, scaling, and cost for ML workloads.",
    tasks: ["Understand GPU scheduling on K8s", "Practice autoscaling inference", "Track & control compute cost"],
  },

  // ─────────────────────────  Software Architect  ───────────────────────
  {
    module: "architect",
    name: "Architecture Fundamentals",
    description: "Components, boundaries, and quality attributes.",
    tasks: ["Read architecture characteristics (the '-ilities')", "Understand coupling & cohesion", "Learn the role of an architect"],
  },
  {
    module: "architect",
    name: "Architectural Styles",
    description: "Monolith, microservices, serverless, and more.",
    tasks: ["Compare monolith vs microservices", "Read modular monolith", "Understand serverless tradeoffs", "Study the strangler-fig migration"],
  },
  {
    module: "architect",
    name: "Domain-Driven Design",
    description: "Bounded contexts and a shared language.",
    tasks: ["Read strategic DDD (bounded contexts)", "Practice event storming", "Understand aggregates & entities"],
  },
  {
    module: "architect",
    name: "Scalability & Performance",
    description: "Handling load without falling over.",
    tasks: ["Read horizontal vs vertical scaling", "Understand CAP & PACELC", "Design for caching & CDNs", "Practice capacity estimation"],
  },
  {
    module: "architect",
    name: "Reliability & Resilience",
    description: "Failing gracefully under pressure.",
    tasks: ["Read circuit breaker & bulkhead patterns", "Design retries & backoff", "Understand graceful degradation", "Plan for disaster recovery (RTO/RPO)"],
  },
  {
    module: "architect",
    name: "Event-Driven Architecture",
    description: "Async, decoupled, event-first systems.",
    tasks: ["Read event-driven vs request/response", "Understand event sourcing & CQRS", "Design the saga pattern", "Handle idempotency & ordering"],
  },
  {
    module: "architect",
    name: "Data Architecture",
    description: "Storage choices across the system.",
    tasks: ["Compare SQL vs NoSQL vs NewSQL", "Read polyglot persistence", "Understand data lakes vs warehouses", "Design a change-data-capture flow"],
  },
  {
    module: "architect",
    name: "Security Architecture",
    description: "Defense in depth and zero trust.",
    tasks: ["Read zero-trust principles", "Design secrets & key management", "Threat-model a system (STRIDE)"],
  },
  {
    module: "architect",
    name: "Documentation & ADRs",
    description: "Recording decisions and diagrams that last.",
    tasks: ["Write an Architecture Decision Record", "Practice the C4 model diagrams", "Do a trade-off analysis (ATAM-lite)"],
  },

  // ──────────────────────────  Design Patterns  ─────────────────────────
  {
    module: "patterns",
    name: "OOP & Principles",
    description: "The foundation patterns build on.",
    tasks: ["Revise encapsulation/inheritance/polymorphism", "Read 'composition over inheritance'", "Understand programming to interfaces"],
  },
  {
    module: "patterns",
    name: "Creational Patterns",
    description: "Flexible, controlled object creation.",
    tasks: ["Factory Method", "Abstract Factory", "Builder", "Singleton (and its pitfalls)", "Prototype"],
  },
  {
    module: "patterns",
    name: "Structural Patterns",
    description: "Composing objects into larger structures.",
    tasks: ["Adapter", "Decorator", "Facade", "Proxy", "Composite", "Bridge"],
  },
  {
    module: "patterns",
    name: "Behavioral Patterns",
    description: "Communication and responsibility between objects.",
    tasks: ["Strategy", "Observer", "Command", "State", "Template Method", "Chain of Responsibility", "Iterator"],
  },
  {
    module: "patterns",
    name: "Concurrency Patterns",
    description: "Coordinating work across threads.",
    tasks: ["Producer–Consumer", "Read-Write Lock", "Thread Pool", "Future / Promise"],
  },
  {
    module: "patterns",
    name: "Enterprise & Integration",
    description: "Patterns for larger systems.",
    tasks: ["Repository", "Unit of Work", "Dependency Injection", "CQRS", "Outbox pattern"],
  },
  {
    module: "patterns",
    name: "Anti-patterns",
    description: "Knowing what to avoid.",
    tasks: ["Read God object & spaghetti code", "Understand premature optimization", "Recognize the golden hammer"],
  },

  // ───────────────────  Claude Architect Certificate  ───────────────────
  {
    module: "claude",
    name: "Claude Fundamentals",
    description: "Models, the Messages API, and when to use Claude.",
    tasks: ["Read the Claude model family & tradeoffs", "Understand the Messages API", "Learn system vs user vs assistant turns", "Set up the Anthropic SDK"],
  },
  {
    module: "claude",
    name: "Prompt Engineering with Claude",
    description: "Getting reliable, structured output from Claude.",
    tasks: ["Use XML tags for structure", "Practice few-shot prompting", "Prefill the assistant turn", "Control output with stop sequences"],
  },
  {
    module: "claude",
    name: "Tool Use & Function Calling",
    description: "Letting Claude call your code.",
    tasks: ["Read tool-use docs", "Define a tool schema", "Handle the tool_use / tool_result loop", "Force & parallel tool calls"],
  },
  {
    module: "claude",
    name: "MCP with Claude",
    description: "Connecting Claude to tools and data via MCP.",
    tasks: ["Read the MCP spec", "Build an MCP server", "Expose tools & resources", "Connect it to Claude Desktop / Code"],
  },
  {
    module: "claude",
    name: "Building Effective Agents",
    description: "Anthropic's agent design principles.",
    tasks: ["Read 'Building effective agents'", "Compare workflows vs agents", "Implement prompt chaining & routing", "Add orchestrator–worker patterns"],
  },
  {
    module: "claude",
    name: "Context & Prompt Caching",
    description: "Cost and latency optimization.",
    tasks: ["Read prompt caching docs", "Structure prompts for cache hits", "Measure token & cost savings"],
  },
  {
    module: "claude",
    name: "Evals & Safety",
    description: "Measuring quality and reducing harm.",
    tasks: ["Build an eval suite", "Add an LLM-as-judge grader", "Design guardrails & refusal handling", "Reduce hallucination with grounding"],
  },
  {
    module: "claude",
    name: "Claude Code & Agent SDK",
    description: "Shipping agents with Anthropic tooling.",
    tasks: ["Explore Claude Code workflows", "Read the Agent SDK", "Build a custom subagent", "Practice a full agentic task"],
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
    where: { name: "SwitchUp" },
    create: {
      name: "SwitchUp",
      description: "Personal career level-up operating system",
      order: 0,
    },
    update: { description: "Personal career level-up operating system" },
  });

  const projectTasks = [
    "Polish Dashboard",
    "Ship Today reminders",
    "Seed roadmaps",
    "Add heatmap",
    "Wire completion animations",
  ];
  for (const [i, title] of projectTasks.entries()) {
    const existing = await prisma.task.findFirst({
      where: { module: "projects", topic: "SwitchUp", title },
    });
    if (!existing) {
      await prisma.task.create({
        data: {
          title,
          module: "projects",
          topic: "SwitchUp",
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
          title: "Model Context Protocol — Introduction",
          source: "Anthropic",
          url: "https://modelcontextprotocol.io/introduction",
          mustRead: true,
        },
        {
          title: "Prompt engineering overview",
          source: "Anthropic Docs",
          url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview",
          mustRead: true,
        },
        {
          title: "The Twelve-Factor App",
          source: "12factor.net",
          url: "https://12factor.net",
          mustRead: false,
        },
        {
          title: "Hidden Technical Debt in Machine Learning Systems",
          source: "Google (NeurIPS)",
          url: "https://papers.nips.cc/paper/2015/hash/86df7dcfd896fcaf2674f757a2463eba-Abstract.html",
          mustRead: true,
        },
        {
          title: "Refactoring Guru — Design Patterns",
          source: "Refactoring.Guru",
          url: "https://refactoring.guru/design-patterns",
          mustRead: false,
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
