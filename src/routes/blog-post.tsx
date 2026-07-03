import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { BlogPost, fetchBlogPostBySlug } from "../lib/supabase";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";

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
      <div className="mx-auto max-w-4xl px-6 py-20 text-center text-muted-foreground">
        Loading post…
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <p className="mt-4 text-lg text-muted-foreground">{error || "Post not found"}</p>
        <Link
          to="/blog"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 md:py-12">
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-10"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to blog
      </Link>

      <article>
        {/* Metadata Header */}
        <div className="mb-8 flex flex-wrap items-center gap-4 text-sm">
          <time
            dateTime={post.updated_at}
            className="font-medium text-muted-foreground uppercase tracking-wider"
          >
            {new Date(post.updated_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          {post.published ? (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
              Published
            </span>
          ) : (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
              Draft
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-10">
          {post.title}
        </h1>

        {/* Content */}
        <div className="prose prose-stone dark:prose-invert prose-lg max-w-none text-foreground">
          {post.body.startsWith("<") || post.body.includes("<") ? (
            // If it's HTML content (from rich text editor)
            <div dangerouslySetInnerHTML={{ __html: post.body }} />
          ) : (
            // If it's markdown content
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
              {post.body}
            </ReactMarkdown>
          )}
        </div>
      </article>
    </div>
  );
}
