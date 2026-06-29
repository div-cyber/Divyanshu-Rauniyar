import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ComingSoon } from "../components/coming-soon";
import { useContentSection } from "../hooks/use-content-section";
import { BlogPost, fetchBlogPosts } from "../lib/supabase";

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
        setPosts(data ?? []);
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

      <div className="mt-12 grid gap-6">
        {posts.map((post) => (
          <article key={post.id} className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
              <span>{post.published ? "Published" : "Draft"}</span>
              <span>{new Date(post.updated_at).toLocaleDateString()}</span>
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground">{post.title}</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              {post.body.slice(0, 220)}
              {post.body.length > 220 ? "…" : ""}
            </p>
            <div className="mt-6 flex items-center justify-between gap-3 text-sm text-muted-foreground">
              <span className="rounded-full border border-border px-3 py-1">/{post.slug}</span>
              <Link
                to={`/blog/${post.slug}`}
                className="text-foreground transition hover:text-foreground/80"
              >
                Read more →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
