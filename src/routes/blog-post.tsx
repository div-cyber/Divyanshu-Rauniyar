import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { BlogPost, fetchBlogPostBySlug } from "../lib/supabase";
import { ArrowLeft } from "lucide-react";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadPost() {
      if (!slug) return;

      const { data, error } = await fetchBlogPostBySlug(slug);
      if (!mounted) return;

      if (error) {
        setError(error.message);
      } else if (!data) {
        setError("Post not found");
      } else {
        setPost(data);
      }
      setLoading(false);
    }

    loadPost();

    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8 text-center text-muted-foreground">
        Loading post…
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8 text-center">
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <p className="mt-4 text-lg text-muted-foreground">{error || "Post not found"}</p>
        <Link
          to="/blog"
          className="mt-6 inline-flex items-center gap-2 text-foreground hover:text-foreground/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to blog
      </Link>

      <article>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>{post.published ? "Published" : "Draft"}</span>
          <span>{new Date(post.updated_at).toLocaleDateString()}</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6">
          {post.title}
        </h1>

        <div className="prose prose-stone dark:prose-invert max-w-none text-foreground">
          {post.body.split("\n").map((paragraph, idx) => (
            <p key={idx} className="mb-4 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}
