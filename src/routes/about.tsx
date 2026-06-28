import { Download } from "lucide-react";
import { useContentSection } from "../hooks/use-content-section";

export default function AboutPage() {
  const { section } = useContentSection("about");
  const title = section?.title ?? "A developer building thoughtful software from Nepal.";
  const intro = section?.body ?? "Most of my work sits at the intersection of product engineering and applied AI. I enjoy turning fuzzy ideas into systems that ship, hold up under real users, and stay easy to evolve.";

  const timeline = [
    { year: "2026", title: "Founded BLACKBYTE", desc: "Started an engineering studio building thoughtful software and AI products from Nepal." },
    { year: "2025", title: "Full-time on AI products", desc: "Shipped multiple LLM-powered tools, internal evals, and developer experiences." },
    { year: "2024", title: "Full-stack engineering", desc: "Led product engineering across web, mobile, and infrastructure for early-stage startups." },
    { year: "2022", title: "Began teaching", desc: "Started writing and mentoring developers — the practice that taught me the most." },
    { year: "2020", title: "First production app", desc: "Shipped my first product used by real users. Got hooked on the craft." },
  ];

  const stack = {
    Languages: ["TypeScript", "Python", "Go", "Rust", "SQL"],
    Frontend: ["React", "Next.js", "Tailwind CSS", "shadcn/ui", "Framer Motion"],
    Backend: ["Node.js", "FastAPI", "Postgres", "Prisma", "Redis", "tRPC"],
    AI: ["OpenAI", "Anthropic", "LangChain", "LlamaIndex", "Embeddings", "Evals"],
    Infra: ["Vercel", "Cloudflare", "Docker", "Supabase", "GitHub Actions"],
  };

  const values = [
    { title: "Taste over trend", desc: "Build what's right for the user, not what's loudest on the timeline." },
    { title: "Ship calmly", desc: "Small, consistent steps beat heroic sprints. Boring is a feature." },
    { title: "Document everything", desc: "If it's worth doing, it's worth a note. The second brain compounds." },
    { title: "Teach what you learn", desc: "Writing turns vague intuition into durable knowledge." },
  ];

  return (
    <div className="prose-content fade-up px-5 py-20">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">About Me</p>
      <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
        {title}
      </h1>

      <div className="mt-10 space-y-5 text-[1.05rem] leading-[1.8] text-muted-foreground">
        <p>
          I'm <span className="text-foreground font-semibold">Divyanshu Rauniyar</span> — a full-stack developer, AI engineer, and entrepreneur. I founded <span className="text-foreground font-semibold">BLACKBYTE</span>, an engineering studio where we build thoughtful software and AI products for teams who care about craft.
        </p>
        <p>{intro}</p>
        <p>
          This site is my digital headquarters. Articles, projects, notes, AI experiments, and the occasional personal essay live here. I treat it like a long-running notebook — written for myself first, and shared in case it's useful to you.
        </p>
      </div>

      <div className="mt-10">
        <a
          href="/resume.pdf"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <Download className="h-4 w-4" />
          Download Resume
        </a>
      </div>

      <Section title="Journey">
        <ol className="relative mt-2 space-y-6 border-l border-border pl-6">
          {timeline.map((t) => (
            <li key={t.year} className="relative">
              <span className="absolute -left-[29px] top-1.5 inline-block h-2.5 w-2.5 rounded-full bg-foreground ring-4 ring-background" />
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t.year}</div>
              <div className="mt-1 text-base font-semibold text-foreground">{t.title}</div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Tech I reach for">
        <div className="mt-2 space-y-5">
          {Object.entries(stack).map(([group, items]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{group}</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {items.map((i) => (
                  <span key={i} className="inline-flex items-center rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">
                    {i}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Values">
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          {values.map((v) => (
            <div key={v.title} className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-base font-bold tracking-tight text-foreground">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Beyond code">
        <ul className="mt-2 space-y-3 text-[1rem] leading-relaxed text-muted-foreground">
          <li><span className="text-foreground font-medium">Reading</span> — A Philosophy of Software Design, Shape Up, Working in Public.</li>
          <li><span className="text-foreground font-medium">Watching</span> — Vinland Saga, Frieren, and the occasional studio Ghibli rewatch.</li>
          <li><span className="text-foreground font-medium">Learning</span> — Distributed systems, Rust, and the business side of running a studio.</li>
          <li><span className="text-foreground font-medium">Teaching</span> — Mentoring developers, writing essays, and running small workshops.</li>
        </ul>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
      {children}
    </section>
  );
}
