import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Github, Linkedin, Twitter, Instagram, Mail, FileText } from "lucide-react";
import { useContentSection } from "../hooks/use-content-section";
import { useGithubRepos } from "../hooks/use-github-repos";
import { BlogPost, Note, defaultContent, fetchBlogPosts, fetchNotes } from "../lib/supabase";

const socials = [
  { href: "https://github.com/", label: "GitHub", Icon: Github },
  { href: "https://linkedin.com/", label: "LinkedIn", Icon: Linkedin },
  { href: "https://twitter.com/", label: "Twitter", Icon: Twitter },
  { href: "https://instagram.com/", label: "Instagram", Icon: Instagram },
  { href: "mailto:hello@blackbyte.dev", label: "Email", Icon: Mail },
  { href: "/resume.pdf", label: "Resume", Icon: FileText },
];

export default function IndexPage() {
  const { section: homeSection } = useContentSection("home");
  const { repos: githubRepos, loading: reposLoading, error: reposError } = useGithubRepos("div-cyber", 50);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [contentLoading, setContentLoading] = useState(true);
  const [contentError, setContentError] = useState<string | null>(null);

  const heroTitle = homeSection?.title ?? defaultContent.home.title;
  const heroBody = homeSection?.body ?? defaultContent.home.body;

  const recentRepos = githubRepos.slice(0, 3);

  useEffect(() => {
    let mounted = true;

    async function loadContent() {
      try {
        const [postsResult, notesResult] = await Promise.all([fetchBlogPosts(), fetchNotes()]);

        if (!mounted) {
          return;
        }

        if (postsResult.error) {
          throw new Error(postsResult.error.message);
        }

        if (notesResult.error) {
          throw new Error(notesResult.error.message);
        }

        setPosts(postsResult.data ?? []);
        setNotes(notesResult.data ?? []);
      } catch (error) {
        if (!mounted) {
          return;
        }

        setContentError(error instanceof Error ? error.message : String(error));
      } finally {
        if (mounted) {
          setContentLoading(false);
        }
      }
    }

    loadContent();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <section className="space-y-10">
        <section className="max-w-4xl fade-up">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground" style={{ animationDelay: "0ms" }}>Hello</p>
          <h1 className="mt-4 text-5xl font-extrabold tracking-tight sm:text-6xl text-foreground" style={{ animationDelay: "120ms" }}>{heroTitle}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground" style={{ animationDelay: "240ms" }}>
            {heroBody}
          </p>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Recent projects</h2>
              <p className="mt-2 text-sm text-muted-foreground">Latest work from GitHub.</p>
            </div>
            <Link to="/projects" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground">
              View all projects
            </Link>
          </div>

          {reposLoading ? (
            <div className="space-y-4">
              <div className="rounded-3xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">Fetching latest projects from GitHub…</p>
              </div>
              <div className="rounded-3xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">Fetching latest projects from GitHub…</p>
              </div>
              <div className="rounded-3xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">Fetching latest projects from GitHub…</p>
              </div>
            </div>
          ) : reposError ? (
            <p className="text-sm text-destructive">Failed to load GitHub repos.</p>
          ) : recentRepos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent projects found yet.</p>
          ) : (
            <div className="space-y-4">
              {recentRepos.map((repo) => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-3xl border border-border bg-card p-5 transition hover:border-foreground/20 hover:bg-secondary"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-semibold tracking-tight text-foreground">{repo.name}</h3>
                    <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{repo.language ?? "Code"}</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{repo.description ?? "No description available."}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{new Date(repo.updated_at).toLocaleDateString()}</span>
                    <span>★ {repo.stargazers_count}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      </section>

      <Divider />

      <Section title="Blogs" href="/blog" cta="All blogs">
        {contentLoading ? (
          <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Loading blog posts…
          </div>
        ) : contentError ? (
          <p className="text-sm text-destructive">{contentError}</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No blog posts have been published yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {posts.slice(0, 3).map((post) => (
              <li key={post.id} className="group py-6">
                <Link to={`/blog/${post.slug}`} className="block">
                  <div className="flex items-baseline justify-between gap-4 text-xs text-muted-foreground">
                    <span>{new Date(post.updated_at).toLocaleDateString()}</span>
                    <span>{post.published ? "Published" : "Draft"}</span>
                  </div>
                  <h3 className="mt-2 text-xl font-bold tracking-tight transition-colors group-hover:text-primary">{post.title}</h3>
                  <p className="mt-2 text-[0.975rem] leading-relaxed text-muted-foreground">{post.body.slice(0, 180)}{post.body.length > 180 ? "…" : ""}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Divider />

      <Section title="Notes" href="/notes" cta="All notes">
        {contentLoading ? (
          <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Loading notes…
          </div>
        ) : contentError ? (
          <p className="text-sm text-destructive">{contentError}</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notes have been posted yet.</p>
        ) : (
          <ul className="space-y-3">
            {notes.slice(0, 4).map((note) => (
              <li key={note.id}>
                <Link to="/notes" className="group flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3 text-sm transition-colors hover:border-foreground/20 hover:bg-secondary">
                  <span className="truncate text-foreground">{note.title}</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Divider />

      <section className="py-12">
        <h2 className="text-2xl font-bold tracking-tight">Currently</h2>
        <ul className="mt-6 space-y-3 text-[0.975rem] leading-relaxed text-muted-foreground">
          <li><span className="text-foreground">Building</span> — BLACKBYTE's internal AI tooling and a few client products.</li>
          <li><span className="text-foreground">Learning</span> — Distributed systems, evals, and Rust on the side.</li>
          <li><span className="text-foreground">Writing</span> — A long-form series on shipping AI products with taste.</li>
        </ul>
      </section>

      <Divider />

      <section className="py-14">
        <div className="rounded-2xl border border-border bg-secondary/50 px-6 py-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight">Stay in the loop</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            One thoughtful email a month — new articles, projects, and the occasional behind-the-scenes from BLACKBYTE. No noise.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row">
            <input
              type="email"
              required
              placeholder="you@domain.com"
              className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-foreground/30 focus:ring-2 focus:ring-ring/30"
            />
            <button className="h-10 rounded-md bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90" type="submit">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function Section({ title, href, cta, children }: { title: string; href: string; cta: string; children: React.ReactNode }) {
  return (
    <section className="py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <Link to={href} className="group inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          {cta}
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Divider() {
  return <hr className="border-border" />;
}
