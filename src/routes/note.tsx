import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Note, fetchNoteById } from "../lib/supabase";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";

export default function NotePage() {
  const { id } = useParams<{ id: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadNote() {
      if (!id) return;

      const numId = Number(id);
      if (!isNaN(numId)) {
        const { data, error } = await fetchNoteById(numId);
        if (mounted && data) {
          setNote(data);
        } else if (mounted) {
          setError(error?.message || "Note not found");
        }
      } else if (mounted) {
        setError("Note not found");
      }
      setLoading(false);
    }

    loadNote();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8 text-center text-muted-foreground">
        Loading note…
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8 text-center">
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <p className="mt-4 text-lg text-muted-foreground">{error || "Note not found"}</p>
        <Link
          to="/notes"
          className="mt-6 inline-flex items-center gap-2 text-foreground hover:text-foreground/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to notes
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <Link
        to="/notes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to notes
      </Link>

      <article>
        <div className="mb-6 text-sm text-muted-foreground">
          <span>{new Date(note.updated_at).toLocaleDateString()}</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6">
          {note.title}
        </h1>

        <div className="prose prose-stone dark:prose-invert max-w-none text-foreground">
          {note.body.startsWith("<") || note.body.includes("<") ? (
            <div dangerouslySetInnerHTML={{ __html: note.body }} />
          ) : (
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
              {note.body}
            </ReactMarkdown>
          )}
        </div>
      </article>
    </div>
  );
}
