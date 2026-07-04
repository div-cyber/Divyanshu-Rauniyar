import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";
import { DragHandle } from "@tiptap/extension-drag-handle";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import {
  ArrowLeft,
  Save,
  Trash2,
  Upload,
  Link as LinkIcon,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Code,
  CheckSquare,
  Type,
  Calculator,
  Table as TableIcon,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import {
  uploadImage,
  BlogPost,
  getCurrentSession,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  fetchBlogPosts,
} from "../lib/supabase";
import { useNavigate, useParams } from "react-router-dom";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 200);
}

export default function BlogEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogState, setBlogState] = useState({ title: "", slug: "", body: "", published: true });
  const [blogEditorTab, setBlogEditorTab] = useState<"richtext" | "markdown">("richtext");
  const [blogMarkdown, setBlogMarkdown] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Font size states
  const [currentFontSize, setCurrentFontSize] = useState("16");
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorInputs, setCalculatorInputs] = useState({
    baseSize: "16",
    scaleFactor: "1.25",
    levels: "6",
  });

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

  // Font size functions
  function applyFontSizeRichText(size: string) {
    if (!editor) return;
    
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");
    
    if (from === to) {
      // No text selected: insert span with placeholder
      editor
        .chain()
        .focus()
        .insertContentAt(from, `<span style="font-size: ${size}px">text</span>`)
        .run();
    } else {
      // Text selected: wrap it in span
      editor
        .chain()
        .focus()
        .insertContentAt({ from, to }, `<span style="font-size: ${size}px">${selectedText}</span>`)
        .run();
    }
  }

  function applyFontSizeMarkdown(textarea: HTMLTextAreaElement | null, value: string, setter: (value: string) => void, size: string) {
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || "text";
    const replacement = `<span style="font-size: ${size}px">${selected}</span>`;
    const nextValue = value.slice(0, start) + replacement + value.slice(end);

    setter(nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + replacement.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  // Calculate font size scale
  function calculateFontSizes() {
    const base = parseFloat(calculatorInputs.baseSize);
    const scale = parseFloat(calculatorInputs.scaleFactor);
    const levels = parseInt(calculatorInputs.levels);
    
    const sizes = [];
    for (let i = 0; i < levels; i++) {
      const size = base * Math.pow(scale, i);
      sizes.push({
        level: i,
        size: Math.round(size * 100) / 100,
      });
    }
    return sizes;
  }

  // Insert markdown table
  function insertMarkdownTable() {
    if (!noteTextareaRef.current) return;
    
    const tableMarkdown = `| Header 1 | Header 2 | Header 3 |
| --- | --- | --- |
| Row 1, Col 1 | Row 1, Col 2 | Row 1, Col 3 |
| Row 2, Col 1 | Row 2, Col 2 | Row 2, Col 3 |`;
    
    const textarea = noteTextareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextValue = blogMarkdown.slice(0, start) + tableMarkdown + blogMarkdown.slice(end);
    
    setBlogMarkdown(nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + tableMarkdown.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  // Insert rich text table
  function insertRichTextTable() {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }

  const [editorState, setEditorState] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder: "Write your blog post body..." }),
      DragHandle,
      TaskList.configure({ HTMLAttributes: { class: "flex flex-col gap-2" } }),
      TaskItem.configure({
        HTMLAttributes: { class: "flex items-center gap-2" },
        nested: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse border border-border w-full",
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-border bg-secondary/50 px-2 py-1 font-semibold",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-border px-2 py-1",
        },
      }),
    ],
    content: blogState.body,
    editorProps: {
      attributes: {
        class:
          "min-h-[420px] w-full rounded-2xl bg-background px-4 py-4 text-sm text-foreground outline-none focus:outline-none border border-border",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (html !== blogState.body) {
        setBlogState((prev) => ({ ...prev, body: html }));
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
    if (currentContent !== blogState.body) {
      editor.commands.setContent(blogState.body || "");
    }
  }, [editor, blogState.body]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data } = await getCurrentSession();
      if (!mounted) return;

      if (data?.session) {
        setSession(data.session);
        await loadBlogPosts();
        if (id) {
          const post = blogPosts.find((p) => p.id === parseInt(id));
          if (post) {
            setBlogState({
              title: post.title,
              slug: post.slug,
              body: post.body,
              published: post.published,
            });
            // Check if content looks like markdown
            if (!(post.body.startsWith("<") || post.body.includes("<"))) {
              setBlogMarkdown(post.body);
              setBlogEditorTab("markdown");
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
  }, [id, blogPosts, navigate]);

  async function loadBlogPosts() {
    const { data, error } = await fetchBlogPosts();
    if (!error) {
      setBlogPosts(data || []);
    }
  }

  async function handleSave() {
    if (!blogState.title.trim()) {
      setMessage("Blog title is required.");
      return;
    }

    setSaving(true);
    setMessage(null);

    let finalBody: string;
    if (blogEditorTab === "markdown") {
      finalBody = blogMarkdown;
    } else {
      finalBody = blogState.body;
    }

    if (id) {
      const { error } = await updateBlogPost(parseInt(id), {
        title: blogState.title,
        slug: blogState.slug || slugify(blogState.title),
        body: finalBody,
        published: blogState.published,
      });

      if (error) {
        setMessage(error.message);
        setSaving(false);
        return;
      }

      setMessage("Blog updated.");
    } else {
      const { error } = await createBlogPost({
        title: blogState.title,
        slug: blogState.slug || slugify(blogState.title),
        body: finalBody,
        published: blogState.published,
      });

      if (error) {
        setMessage(error.message);
        setSaving(false);
        return;
      }

      setMessage("Blog created.");
    }

    setSaving(false);
    await loadBlogPosts();
  }

  async function handleDelete() {
    if (!id) {
      return;
    }

    if (!window.confirm("Delete this blog post?")) {
      return;
    }

    setIsDeleting(true);
    setMessage(null);

    const { error } = await deleteBlogPost(parseInt(id));

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
              Blog Editor
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight">
              {id ? "Edit Post" : "Create New Post"}
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
              {saving ? "Saving..." : "Save Post"}
            </button>
          </div>
        </div>

        {/* Title & Slug */}
        <div className="grid gap-6 mb-8">
          <label className="block text-sm font-semibold text-foreground">
            Title
            <input
              value={blogState.title}
              onChange={(event) => setBlogState((prev) => ({ ...prev, title: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/60 focus:ring-2 focus:ring-ring/30"
            />
          </label>

          <label className="block text-sm font-semibold text-foreground">
            Slug
            <input
              value={blogState.slug}
              onChange={(event) => setBlogState((prev) => ({ ...prev, slug: event.target.value }))}
              placeholder="auto-generated from title"
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/60 focus:ring-2 focus:ring-ring/30"
            />
          </label>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <input
                type="checkbox"
                checked={blogState.published}
                onChange={(e) => setBlogState((prev) => ({ ...prev, published: e.target.checked }))}
                className="rounded border-border"
              />
              Published
            </label>
          </div>
        </div>

        {/* Editor Tabs */}
        <div className="flex gap-2 rounded-2xl border border-border bg-secondary/50 p-2 mb-8">
          <button
            type="button"
            onClick={() => setBlogEditorTab("richtext")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
              blogEditorTab === "richtext"
                ? "bg-foreground text-background"
                : "bg-transparent text-muted-foreground hover:bg-foreground/10"
            }`}
          >
            Rich Text Editor
          </button>
          <button
            type="button"
            onClick={() => setBlogEditorTab("markdown")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
              blogEditorTab === "markdown"
                ? "bg-foreground text-background"
                : "bg-transparent text-muted-foreground hover:bg-foreground/10"
            }`}
          >
            Markdown / LaTeX
          </button>
        </div>

        {/* Toolbar */}
        <div className="mb-6 grid gap-2 rounded-2xl border border-border/60 bg-secondary/30 p-3">
          {blogEditorTab === "richtext" ? (
            <div className="flex flex-wrap gap-2 items-center">
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
              
              {/* Font Size Controls */}
              <div className="flex items-center gap-2 border border-border bg-background rounded-full px-3 py-2">
                <Type className="h-4 w-4 text-muted-foreground" />
                <select
                  value={currentFontSize}
                  onChange={(e) => {
                    const size = e.target.value;
                    setCurrentFontSize(size);
                    if (size) {
                      applyFontSizeRichText(size);
                    }
                  }}
                  className="bg-transparent text-sm border-none outline-none text-foreground"
                >
                  <option value="">Font Size</option>
                  <option value="12">12px</option>
                  <option value="14">14px</option>
                  <option value="16">16px</option>
                  <option value="18">18px</option>
                  <option value="20">20px</option>
                  <option value="24">24px</option>
                  <option value="28">28px</option>
                  <option value="32">32px</option>
                  <option value="36">36px</option>
                  <option value="48">48px</option>
                </select>
              </div>
              
              <button
                type="button"
                onClick={() => setShowCalculator(!showCalculator)}
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30"
              >
                <Calculator className="h-4 w-4" />
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
              <button
                type="button"
                onClick={() => insertRichTextTable()}
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30"
              >
                <TableIcon className="h-4 w-4" />
              </button>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="image-upload-richtext"
                onChange={async (e) => {
                  console.log("Image file selected:", e.target.files?.[0]);
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingImage(true);
                  const url = await uploadImage(file);
                  setUploadingImage(false);
                  if (url) {
                    console.log("Inserting image into editor:", url);
                    editor?.chain().focus().setImage({ src: url }).run();
                    // Log current editor content
                    console.log("Editor content after insert:", editor?.getHTML());
                  }
                }}
              />
              <label
                htmlFor="image-upload-richtext"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30 cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                {uploadingImage ? "Uploading..." : "Upload Image"}
              </label>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 items-center">
              <button
                type="button"
                onClick={() =>
                  toggleWrapper(noteTextareaRef.current, blogMarkdown, setBlogMarkdown, "**")
                }
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  toggleWrapper(noteTextareaRef.current, blogMarkdown, setBlogMarkdown, "*")
                }
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30"
              >
                <Italic className="h-4 w-4" />
              </button>
              
              {/* Font Size Controls for Markdown */}
              <div className="flex items-center gap-2 border border-border bg-background rounded-full px-3 py-2">
                <Type className="h-4 w-4 text-muted-foreground" />
                <select
                  value={currentFontSize}
                  onChange={(e) => {
                    const size = e.target.value;
                    setCurrentFontSize(size);
                    if (size) {
                      applyFontSizeMarkdown(noteTextareaRef.current, blogMarkdown, setBlogMarkdown, size);
                    }
                  }}
                  className="bg-transparent text-sm border-none outline-none text-foreground"
                >
                  <option value="">Font Size</option>
                  <option value="12">12px</option>
                  <option value="14">14px</option>
                  <option value="16">16px</option>
                  <option value="18">18px</option>
                  <option value="20">20px</option>
                  <option value="24">24px</option>
                  <option value="28">28px</option>
                  <option value="32">32px</option>
                  <option value="36">36px</option>
                  <option value="48">48px</option>
                </select>
              </div>
              
              <button
                type="button"
                onClick={() => setShowCalculator(!showCalculator)}
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30"
              >
                <Calculator className="h-4 w-4" />
              </button>
              
              <button
                type="button"
                onClick={() =>
                  togglePrefix(noteTextareaRef.current, blogMarkdown, setBlogMarkdown, "- ")
                }
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  togglePrefix(noteTextareaRef.current, blogMarkdown, setBlogMarkdown, "1. ")
                }
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30"
              >
                <ListOrdered className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  togglePrefix(noteTextareaRef.current, blogMarkdown, setBlogMarkdown, "> ")
                }
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30"
              >
                <Quote className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  toggleWrapper(noteTextareaRef.current, blogMarkdown, setBlogMarkdown, "`")
                }
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30"
              >
                <Code className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => insertLink(noteTextareaRef.current, blogMarkdown, setBlogMarkdown)}
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdownTable()}
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30"
              >
                <TableIcon className="h-4 w-4" />
              </button>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="image-upload-markdown"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingImage(true);
                  const url = await uploadImage(file);
                  setUploadingImage(false);
                  if (url) {
                    setBlogMarkdown((prev) => prev + `![Image](${url})`);
                  }
                }}
              />
              <label
                htmlFor="image-upload-markdown"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:border-foreground/30 cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                {uploadingImage ? "Uploading..." : "Upload Image"}
              </label>
            </div>
          )}
        </div>

        {/* Font Size Calculator */}
        {showCalculator && (
          <div className="mb-6 rounded-2xl border border-border bg-background p-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.18em] mb-4 flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Font Size Scale Calculator
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Base Size (px)</label>
                <input
                  type="number"
                  value={calculatorInputs.baseSize}
                  onChange={(e) => setCalculatorInputs({ ...calculatorInputs, baseSize: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/60 focus:ring-2 focus:ring-ring/30"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Scale Factor</label>
                <input
                  type="number"
                  step="0.01"
                  value={calculatorInputs.scaleFactor}
                  onChange={(e) => setCalculatorInputs({ ...calculatorInputs, scaleFactor: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/60 focus:ring-2 focus:ring-ring/30"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Number of Levels</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={calculatorInputs.levels}
                  onChange={(e) => setCalculatorInputs({ ...calculatorInputs, levels: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/60 focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {calculateFontSizes().map(({ level, size }) => (
                <div key={level} className="rounded-xl border border-border bg-secondary/30 p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Level {level + 1}</div>
                  <div style={{ fontSize: `${size}px` }} className="font-semibold text-foreground">
                    {size}px
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (blogEditorTab === "richtext") {
                        applyFontSizeRichText(String(size));
                      } else {
                        applyFontSizeMarkdown(noteTextareaRef.current, blogMarkdown, setBlogMarkdown, String(size));
                      }
                      setCurrentFontSize(String(size));
                    }}
                    className="mt-2 text-xs bg-foreground text-background px-2 py-1 rounded-full hover:opacity-90 transition"
                  >
                    Use Size
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview Section */}
        <div className="mb-8 rounded-2xl border border-border bg-background p-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.18em] mb-4">
            Preview
          </h3>
          <div className="prose prose-sm max-w-none">
            {blogEditorTab === "richtext" ? (
              (() => {
                const html = editor?.getHTML() || "";
                console.log("Preview HTML (richtext):", html);
                return <div dangerouslySetInnerHTML={{ __html: html }} key={editorState} />;
              })()
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                {blogMarkdown || "Start writing to preview!"}
              </ReactMarkdown>
            )}
          </div>
        </div>

        {/* Edit Section */}
        <div className="rounded-2xl border border-border bg-background p-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.18em] mb-4">
            Editor
          </h3>
          {blogEditorTab === "richtext" ? (
            editor && <EditorContent editor={editor} />
          ) : (
            <textarea
              ref={noteTextareaRef}
              value={blogMarkdown}
              onChange={(event) => setBlogMarkdown(event.target.value)}
              rows={15}
              placeholder="Start writing your blog post in Markdown / LaTeX..."
              className="w-full rounded-2xl border border-border bg-background px-4 py-4 text-sm text-foreground outline-none transition-colors focus:border-foreground/60 focus:ring-2 focus:ring-ring/30 resize-vertical"
            />
          )}
        </div>
      </div>
    </div>
  );
}
