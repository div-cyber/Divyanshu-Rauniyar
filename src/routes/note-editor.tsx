import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import DragHandle from "@tiptap/extension-drag-handle";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import {
  ArrowLeft,
  Save,
  Trash2,
  Upload,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  CheckSquare,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import {
  uploadImage,
  Note,
  getCurrentSession,
  createNote,
  updateNote,
  deleteNote,
  fetchNotes,
} from "../lib/supabase";
import { useNavigate, useParams } from "react-router-dom";

export default function NoteEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteState, setNoteState] = useState({ title: "", body: "" });
  const [noteEditorTab, setNoteEditorTab] = useState<"richtext" | "markdown">("richtext");
  const [noteMarkdown, setNoteMarkdown] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const noteTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  function replaceTextareaSelection(
    textarea: HTMLTextAreaElement | null,
    value: string,
    setter: (value: string) => void,
    transform: (selected: string) => string,
  ) {
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const replacement = transform(selected);
    const nextValue = value.slice(0, start) + replacement + value.slice(end);

    setter(nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + replacement.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  function toggleWrapper(
    textarea: HTMLTextAreaElement | null,
    value: string,
    setter: (value: string) => void,
    wrapper: string,
    placeholder = "text",
  ) {
    replaceTextareaSelection(textarea, value, setter, (selected) => {
      const content = selected || placeholder;
      const isWrapped = content.startsWith(wrapper) && content.endsWith(wrapper);
      return isWrapped
        ? content.slice(wrapper.length, content.length - wrapper.length)
        : `${wrapper}${content}${wrapper}`;
    });
  }

  function togglePrefix(
    textarea: HTMLTextAreaElement | null,
    value: string,
    setter: (value: string) => void,
    prefix: string,
    placeholder = "item",
  ) {
    replaceTextareaSelection(textarea, value, setter, (selected) => {
      const content = selected || placeholder;
      const lines = content.split("\n");
      const allPrefixed = lines.every((line) => line.startsWith(prefix));
      return lines
        .map((line) => (allPrefixed ? line.slice(prefix.length) : `${prefix}${line}`))
        .join("\n");
    });
  }

  function insertLink(
    textarea: HTMLTextAreaElement | null,
    value: string,
    setter: (value: string) => void,
  ) {
    if (!textarea) {
      return;
    }

    const url = window.prompt("Enter link URL");
    if (!url) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || "link text";
    const replacement = `[${selected}](${url})`;
    const nextValue = value.slice(0, start) + replacement + value.slice(end);

    setter(nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + replacement.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  const [editorState, setEditorState] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder: "Write your note body..." }),
      DragHandle,
      TaskList.configure({ HTMLAttributes: { class: "flex flex-col gap-2" } }),
      TaskItem.configure({
        HTMLAttributes: { class: "flex items-center gap-2" },
        nested: true,
      }),
    ],
    content: noteState.body,
    editorProps: {
      attributes: {
        class:
          "min-h-[420px] w-full rounded-2xl bg-background px-4 py-4 text-sm text-foreground outline-none focus:outline-none border border-border",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (html !== noteState.body) {
        setNoteState((prev) => ({ ...prev, body: html }));
      }
      setEditorState((prev) => prev + 1);
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const updateActiveState = () => setEditorState((prev) => prev + 1);
    editor.on("selectionUpdate", updateActiveState);

    return () => {
      editor.off("selectionUpdate", updateActiveState);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentContent = editor.getHTML();
    if (currentContent !== noteState.body) {
      editor.commands.setContent(noteState.body || "");
    }
  }, [editor, noteState.body]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data } = await getCurrentSession();
      if (!mounted) return;

      if (data?.session) {
        setSession(data.session);
        await loadNotes();
        if (id) {
          const note = notes.find((n) => n.id === parseInt(id));
          if (note) {
            setNoteState({
              title: note.title,
              body: note.body,
            });
            // Check if content looks like markdown
            if (!(note.body.startsWith("<") || note.body.includes("<"))) {
              setNoteMarkdown(note.body);
              setNoteEditorTab("markdown");
            }
          }
        }
      } else {
        navigate("/admin");
      }
      setLoading(false);
    }

    init();

    return () => {
      mounted = false;
    };
  }, [id, notes]);

  async function loadNotes() {
    const { data, error } = await fetchNotes();
    if (!error) {
      setNotes(data || []);
    }
  }

  async function handleSave() {
    if (!noteState.title.trim()) {
      setMessage("Note title is required.");
      return;
    }

    setSaving(true);
    setMessage(null);

    let finalBody: string;
    if (noteEditorTab === "markdown") {
      finalBody = noteMarkdown;
    } else {
      finalBody = noteState.body;
    }

    if (id) {
      const { error } = await updateNote(parseInt(id), {
        title: noteState.title,
        body: finalBody,
      });

      if (error) {
        setMessage(error.message);
        setSaving(false);
        return;
      }

      setMessage("Note updated.");
    } else {
      const { error } = await createNote({
        title: noteState.title,
        body: finalBody,
      });

      if (error) {
        setMessage(error.message);
        setSaving(false);
        return;
      }

      setMessage("Note created.");
    }

    setSaving(false);
    await loadNotes();
  }

  async function handleDelete() {
    if (!id) {
      return;
    }

    if (!window.confirm("Delete this note?")) {
      return;
    }

    setIsDeleting(true);
    setMessage(null);

    const { error } = await deleteNote(parseInt(id));

    setIsDeleting(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    navigate("/admin");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-center text-muted-foreground">
        Loading editor…
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="w-full px-6 py-12">
      <button
        type="button"
        onClick={() => navigate("/admin")}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to admin
      </button>

      {message ? (
        <div className="rounded-3xl border border-emerald-300/40 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 mb-8">
          {message}
        </div>
      ) : null}

      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Note Editor
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight">
              {id ? "Edit Note" : "Create New Note"}
            </h1>
          </div>
          <div className="flex gap-3">
            {id ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-full border border-destructive bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive transition hover:bg-destructive/20 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:bg-foreground/90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Note"}
            </button>
          </div>
        </div>

        <div className="grid gap-6 mb-8">
          <label className="block text-sm font-semibold text-foreground">
            Title
            <input
              value={noteState.title}
              onChange={(event) => setNoteState((prev) => ({ ...prev, title: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/60 focus:ring-2 focus:ring-ring/30"
            />
          </label>
        </div>

        <div className="flex gap-2 rounded-2xl border border-border bg-secondary/50 p-2 mb-8">
          <button
            type="button"
            onClick={() => setNoteEditorTab("richtext")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
              noteEditorTab === "richtext"
                ? "bg-foreground text-background"
                : "bg-transparent text-muted-foreground hover:bg-foreground/10"
            }`}
          >
            Rich Text Editor
          </button>
          <button
            type="button"
            onClick={() => setNoteEditorTab("markdown")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
              noteEditorTab === "markdown"
                ? "bg-foreground text-background"
                : "bg-transparent text-muted-foreground hover:bg-foreground/10"
            }`}
          >
            Markdown / LaTeX
          </button>
        </div>

        <div className="mb-6 grid gap-2 rounded-2xl border border-border/60 bg-secondary/30 p-3">
          {noteEditorTab === "richtext" ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30"
              >
                <UnderlineIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30"
              >
                <ListOrdered className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30"
              >
                <Quote className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30"
              >
                <Code className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleTaskList().run()}
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30"
              >
                <CheckSquare className="h-4 w-4" />
              </button>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="image-upload-richtext-note"
                onChange={async (e) => {
                  console.log("Image file selected (note):", e.target.files?.[0]);
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingImage(true);
                  const url = await uploadImage(file);
                  setUploadingImage(false);
                  if (url) {
                    console.log("Inserting image into note editor:", url);
                    editor?.chain().focus().setImage({ src: url }).run();
                    // Log current editor content
                    console.log("Note editor content after insert:", editor?.getHTML());
                  }
                }}
              />
              <label
                htmlFor="image-upload-richtext-note"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30 cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                {uploadingImage ? "Uploading..." : "Upload Image"}
              </label>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  toggleWrapper(noteTextareaRef.current, noteMarkdown, setNoteMarkdown, "**")
                }
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  toggleWrapper(noteTextareaRef.current, noteMarkdown, setNoteMarkdown, "*")
                }
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  togglePrefix(noteTextareaRef.current, noteMarkdown, setNoteMarkdown, "- ")
                }
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  togglePrefix(noteTextareaRef.current, noteMarkdown, setNoteMarkdown, "1. ")
                }
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30"
              >
                <ListOrdered className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  togglePrefix(noteTextareaRef.current, noteMarkdown, setNoteMarkdown, "> ")
                }
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30"
              >
                <Quote className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  toggleWrapper(noteTextareaRef.current, noteMarkdown, setNoteMarkdown, "`")
                }
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30"
              >
                <Code className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => insertLink(noteTextareaRef.current, noteMarkdown, setNoteMarkdown)}
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="image-upload-markdown-note"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingImage(true);
                  const url = await uploadImage(file);
                  setUploadingImage(false);
                  if (url) {
                    setNoteMarkdown((prev) => prev + `![Image](${url})`);
                  }
                }}
              />
              <label
                htmlFor="image-upload-markdown-note"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30 cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                {uploadingImage ? "Uploading..." : "Upload Image"}
              </label>
            </div>
          )}
        </div>

        <div className="mb-8 rounded-2xl border border-border bg-background p-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.18em] mb-4">
            Preview
          </h3>
          <div className="prose prose-sm max-w-none">
            {noteEditorTab === "richtext" ? (
              (() => {
                const html = editor?.getHTML() || "";
                console.log("Note Preview HTML (richtext):", html);
                return <div dangerouslySetInnerHTML={{ __html: html }} key={editorState} />;
              })()
            ) : (
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                {noteMarkdown || "Start writing to preview!"}
              </ReactMarkdown>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.18em] mb-4">
            Editor
          </h3>
          {noteEditorTab === "richtext" ? (
            editor && <EditorContent editor={editor} />
          ) : (
            <textarea
              ref={noteTextareaRef}
              value={noteMarkdown}
              onChange={(event) => setNoteMarkdown(event.target.value)}
              rows={15}
              placeholder="Start writing your note in Markdown / LaTeX..."
              className="w-full rounded-2xl border border-border bg-background px-4 py-4 text-sm text-foreground outline-none transition-colors focus:border-foreground/60 focus:ring-2 focus:ring-ring/30 resize-vertical"
            />
          )}
        </div>
      </div>
    </div>
  );
}
