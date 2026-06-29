import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ComingSoon } from "../components/coming-soon";
import { useContentSection } from "../hooks/use-content-section";
import { Note, fetchNotes } from "../lib/supabase";

export default function NotesPage() {
  const { section } = useContentSection("notes");
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadNotes() {
      const { data, error } = await fetchNotes();
      if (!mounted) {
        return;
      }
      if (error) {
        setError(error.message);
      } else {
        setNotes(data ?? []);
      }
      setLoading(false);
    }

    loadNotes();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8 text-center text-muted-foreground">
        Loading notes…
      </div>
    );
  }

  if (error) {
    return <div className="mx-auto max-w-4xl px-6 py-8 text-center text-destructive">{error}</div>;
  }

  if (notes.length === 0) {
    return (
      <ComingSoon
        eyebrow="Notes"
        title={section?.title ?? "Second brain, loading…"}
        description={
          section?.body ??
          "Snippets, commands, cheatsheets, and reading notes will live here. Building the editor first."
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          {section?.title ?? "Notes"}
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
          {section?.body ?? "Snippets, commands, cheatsheets, and reading notes will live here."}
        </p>
      </div>

      <div className="mt-12 grid gap-6">
        {notes.map((note) => (
          <article key={note.id} className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
              <span>{new Date(note.updated_at).toLocaleDateString()}</span>
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground">{note.title}</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              {note.body.slice(0, 260)}
              {note.body.length > 260 ? "…" : ""}
            </p>
            <div className="mt-6">
              <Link
                to={`/notes/${note.id}`}
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
