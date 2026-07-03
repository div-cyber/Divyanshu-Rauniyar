import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ComingSoon } from "../components/coming-soon";
import { useContentSection } from "../hooks/use-content-section";
import { BlogPost, fetchBlogPosts } from "../lib/supabase";

// Helper function to extract plain text from HTML for previews
function htmlToPlainText(html: string): string {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export default function BlogPage() {
  const { section } = useContentSection("blog");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadPosts() {
      const { data, error } = await fetchBlogPosts();
      if (!mounted) {
        return;
      }
      if (error) {
        setError(error.message);
      } else {
        // Only show published posts
        setPosts((data || []).filter((post) => post.published));
      }
      setLoading(false);
    }

    loadPosts();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8 text-center text-muted-foreground">
        Loading posts…
      </div>
    );
  }

  if (error) {
    return <div className="mx-auto max-w-4xl px-6 py-8 text-center text-destructive">{error}</div>;
  }

  if (posts.length === 0) {
    return (
      <ComingSoon
        eyebrow="Blog"
        title={section?.title ?? "Articles are on the way."}
        description={
          section?.body ??
          "A new long-form series on shipping AI products is being drafted. Subscribe on the homepage to know when the first one ships."
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          {section?.title ?? "Articles"}
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
          {section?.body ?? "A new long-form series on shipping AI products is being drafted."}
        </p>
      </div>

      <div className="mt-12 grid gap-8">
        {posts.map((post) => (
          <article
            key={post.id}
            className="group rounded-3xl border border-border bg-card p-8 shadow-sm hover:border-foreground/20 transition-all"
          >
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {new Date(post.updated_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              {post.published ? (
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
                  Published
                </span>
              ) : (
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                  Draft
                </span>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors">
              {post.title}
            </h2>
            <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
              {(() => {
                const plainText = htmlToPlainText(post.body);
                return plainText.slice(0, 240) + (plainText.length > 240 ? "…" : "");
              })()}
            </p>
            <div className="mt-8">
              <Link
                to={`/blog/${post.slug}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
              >
                Read more
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
