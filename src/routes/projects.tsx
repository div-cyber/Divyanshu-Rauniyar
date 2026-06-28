import { Link } from "react-router-dom";
import { ArrowUpRight, Github, ExternalLink } from "lucide-react";
import { useContentSection } from "../hooks/use-content-section";
import { useGithubRepos } from "../hooks/use-github-repos";

type Status = "Active" | "Shipped" | "In Progress" | "Archived";

const projects: Array<{
  slug: string;
  title: string;
  tag: string;
  year: string;
  status: Status;
  description: string;
  stack: string[];
  github?: string;
  demo?: string;
  featured?: boolean;
}> = [
  {
    slug: "blackbyte",
    title: "BLACKBYTE",
    tag: "Studio",
    year: "2026",
    status: "Active",
    description: "An engineering studio building thoughtful software and AI products. Serves as the umbrella for client work, internal tooling, and a growing library of open-source bits.",
    stack: ["Next.js", "TypeScript", "Postgres", "OpenAI"],
    demo: "https://blackbyte.dev",
    featured: true,
  },
  {
    slug: "parikshya",
    title: "Parikshya",
    tag: "EdTech",
    year: "2025",
    status: "Shipped",
    description: "An exam preparation platform built for Nepali students — adaptive practice, analytics, and well-designed lessons that respect the learner's time.",
    stack: ["React", "Node", "Postgres", "Tailwind"],
    demo: "#",
    featured: true,
  },
  {
    slug: "athletics-pioneer",
    title: "Athletics Pioneer",
    tag: "Sports Tech",
    year: "2025",
    status: "Active",
    description: "Tools for athletes and coaches — track training, monitor performance, and surface insights with a calm, data-first interface.",
    stack: ["React Native", "Supabase", "TypeScript"],
    demo: "#",
  },
  {
    slug: "missing-person-alert",
    title: "Missing Person Alert System",
    tag: "Civic Tech",
    year: "2024",
    status: "Active",
    description: "A community-powered alerting system for missing persons across Nepal. Real-time notifications, verified reports, and a respectful UX for a hard problem.",
    stack: ["Next.js", "PostGIS", "Twilio", "Mapbox"],
    github: "https://github.com/",
    featured: true,
  },
  {
    slug: "ai-model-aggregator",
    title: "AI Model Aggregator",
    tag: "AI Tooling",
    year: "2025",
    status: "In Progress",
    description: "A single workbench to compare, route, and evaluate responses across leading AI providers. Built for developers who actually run evals.",
    stack: ["TypeScript", "OpenAI", "Anthropic", "Bun"],
    github: "https://github.com/",
  },
  {
    slug: "codeforge",
    title: "CodeForge",
    tag: "Developer Tools",
    year: "2024",
    status: "Shipped",
    description: "An AI-assisted coding companion focused on the boring 80% — scaffolds, refactors, and review nudges that respect your codebase.",
    stack: ["TypeScript", "LangChain", "Postgres"],
    github: "https://github.com/",
  },
  {
    slug: "iot-projects",
    title: "IoT Projects",
    tag: "Hardware",
    year: "2023",
    status: "Archived",
    description: "A collection of home-grown IoT experiments — sensors, dashboards, and small automations that taught me a lot about embedded systems.",
    stack: ["ESP32", "MQTT", "Python", "InfluxDB"],
    github: "https://github.com/",
  },
  {
    slug: "portfolio",
    title: "Portfolio",
    tag: "Personal",
    year: "2026",
    status: "Active",
    description: "This very site — a calm, content-first personal headquarters for articles, notes, and selected work.",
    stack: ["React", "Tailwind", "TypeScript"],
    github: "https://github.com/",
    demo: "/",
  },
];

export default function ProjectsPage() {
  const { section } = useContentSection("projects");
  const { repos: githubRepos, loading: githubLoading, error: githubError } = useGithubRepos("div-cyber", 100);
  const intro = section?.body ?? "A selection of products, tools, and experiments — from BLACKBYTE work to weekend hacks. Each one taught me something I still use today.";

  const githubProjects = githubRepos.map((repo) => ({
    slug: repo.name,
    title: repo.name,
    tag: repo.language ?? "Code",
    year: new Date(repo.updated_at).getFullYear().toString(),
    status: projectStatus(repo.updated_at),
    description: repo.description ?? "GitHub repository.",
    stack: repo.language ? [repo.language] : ["Code"],
    github: repo.html_url,
    demo: repo.homepage ?? undefined,
  }));

  const featured = githubProjects.length ? githubProjects.slice(0, 4) : projects.filter((p) => p.featured);
  const rest = githubProjects.length ? githubProjects.slice(4) : projects.filter((p) => !p.featured);

  return (
    <div className="mx-auto max-w-3xl px-5 py-20">
      <div className="fade-up">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">Projects</p>
        <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
          Things I've built.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">{intro}</p>
      </div>

      <section className="mt-16">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Featured</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {(githubLoading || githubError ? projects.filter((p) => p.featured) : featured).map((p) => (
            <ProjectCard key={p.slug} project={p} featured />
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">All projects</h2>
            {githubLoading ? (
              <p className="text-xs text-muted-foreground">Loading GitHub projects...</p>
            ) : githubError ? (
              <p className="text-xs text-destructive">Failed to load GitHub projects. Showing local fallback.</p>
            ) : null}
          </div>
          <a href="https://github.com/div-cyber?tab=repositories" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
            View on GitHub
          </a>
        </div>
        <ul className="mt-5 divide-y divide-border rounded-xl border border-border">
          {(githubLoading || githubError ? rest : rest).map((p) => (
            <li key={p.slug}>
              <ProjectRow project={p} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 rounded-2xl border border-border bg-secondary/50 px-6 py-10 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Want to build something together?</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          BLACKBYTE takes on a small number of partnerships each year. If you have an idea worth building well, I'd love to hear about it.
        </p>
        <Link
          to="/contact"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Get in touch
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}

function projectStatus(updatedAt: string): Status {
  const updated = new Date(updatedAt);
  const daysSinceUpdate = Math.max(0, Math.floor((Date.now() - updated.getTime()) / 86_400_000));

  if (daysSinceUpdate <= 90) {
    return "Active";
  }

  if (daysSinceUpdate <= 180) {
    return "In Progress";
  }

  if (daysSinceUpdate <= 365) {
    return "Shipped";
  }

  return "Archived";
}

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    Active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    Shipped: "bg-primary/10 text-primary border-primary/20",
    "In Progress": "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    Archived: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${map[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function ProjectCard({ project, featured }: { project: (typeof projects)[number]; featured?: boolean }) {
  return (
    <article className={`group flex flex-col rounded-xl border border-border bg-card p-6 transition-colors hover:border-foreground/20 hover:bg-secondary ${featured ? "" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-primary">{project.tag}</span>
        <StatusBadge status={project.status} />
      </div>
      <h3 className="mt-3 text-xl font-bold tracking-tight">{project.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.stack.map((s) => (
          <span key={s} className="rounded-md border border-border bg-background px-2 py-0.5 text-[0.7rem] font-medium text-muted-foreground">
            {s}
          </span>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-3 text-sm">
        {project.demo && (
          <a href={project.demo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-foreground hover:text-primary">
            <ExternalLink className="h-3.5 w-3.5" /> Live
          </a>
        )}
        {project.github && (
          <a href={project.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <Github className="h-3.5 w-3.5" /> Code
          </a>
        )}
        <span className="ml-auto text-xs text-muted-foreground">{project.year}</span>
      </div>
    </article>
  );
}

function ProjectRow({ project }: { project: (typeof projects)[number] }) {
  return (
    <div className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold tracking-tight">{project.title}</h3>
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">· {project.tag}</span>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <StatusBadge status={project.status} />
        {project.github && (
          <a href={project.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="text-muted-foreground hover:text-foreground">
            <Github className="h-4 w-4" />
          </a>
        )}
        {project.demo && (
          <a href={project.demo} target="_blank" rel="noreferrer" aria-label="Live" className="text-muted-foreground hover:text-foreground">
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}

type Project = (typeof projects)[number];
