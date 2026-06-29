import { FormEvent, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { ArrowUpRight, Plus, LogOut, Settings, User, Trash2, Activity } from "lucide-react";
import {
  BlogPost,
  ContentSection,
  Message,
  defaultContent,
  deleteBlogPost,
  deleteContentSection,
  deleteNote,
  fetchBlogPosts,
  fetchContentSections,
  fetchMessages,
  fetchNotes,
  fetchPageMetrics,
  getCurrentSession,
  onAuthStateChange,
  signInWithPassword,
  signOut,
  updateBlogPost,
  updateContentSection,
  updateNote,
  createBlogPost,
  createContentSections,
  createMessage,
  createNote,
} from "../lib/supabase";
import { useGithubRepos } from "../hooks/use-github-repos";

type UserSession = {
  email: string;
};

type AdminTab = "dashboard" | "profile" | "blog" | "notes" | "messages";

type Note = {
  id: number;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
};

type Message = {
  id: number;
  name: string;
  email: string;
  body: string;
  created_at: string;
};

type PageMetric = {
  id: number;
  page: string;
  views: number;
  updated_at: string;
};

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: "dashboard", label: "Dashboard" },
  { id: "profile", label: "Profile" },
  { id: "blog", label: "Blog" },
  { id: "notes", label: "Notes" },
  { id: "messages", label: "Messages" },
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 200);
}

export default function AdminPage() {
  const [email, setEmail] = useState("yanshudiv22@gmail.com");
  const [password, setPassword] = useState("iwillnot_share2008");
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [selectedSection, setSelectedSection] = useState<ContentSection | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [metrics, setMetrics] = useState<PageMetric[]>([]);
  const {
    repos: githubRepos,
    loading: githubLoading,
    error: githubError,
  } = useGithubRepos("div-cyber", 100);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [formState, setFormState] = useState({ title: "", body: "" });
  const [profileState, setProfileState] = useState({
    siteName: "",
    heroTitle: "",
    heroBody: "",
    sidebarAbout: "",
  });
  const [blogState, setBlogState] = useState({ title: "", slug: "", body: "", published: true });
  const [noteState, setNoteState] = useState({ title: "", body: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [signInError, setSignInError] = useState<string | null>(null);

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
      Image,
      Placeholder.configure({ placeholder: "Write your blog post body..." }),
    ],
    content: blogState.body,
    editorProps: {
      attributes: {
        class:
          "min-h-[420px] w-full rounded-2xl bg-background px-3 py-3 text-sm text-foreground outline-none focus:outline-none",
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
      const {
        data: { session },
      } = await getCurrentSession();

      if (!mounted) {
        return;
      }

      if (session?.user) {
        setSession({ email: session.user.email ?? "" });
        await loadAllData();
      }

      setLoading(false);
    }

    const { data: listener } = onAuthStateChange(async (_event, authSession) => {
      if (!mounted) {
        return;
      }

      if (authSession?.user) {
        setSession({ email: authSession.user.email ?? "" });
        await loadAllData();
      } else {
        setSession(null);
      }
    });

    init();

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function loadAllData() {
    await Promise.all([
      loadSections(),
      loadBlogPosts(),
      loadNotes(),
      loadMessages(),
      loadMetrics(),
    ]);
  }

  async function loadSections() {
    const { data, error } = await fetchContentSections();

    if (error) {
      setMessage(error.message);
      return;
    }

    const items = data ?? [];
    setSections(items as ContentSection[]);

    const siteNameSection = items.find((section) => section.type === "site_name");
    const homeSection = items.find((section) => section.type === "home");

    if (siteNameSection) {
      setProfileState((prev) => ({
        ...prev,
        siteName: siteNameSection.title,
        sidebarAbout: siteNameSection.body,
        heroTitle: homeSection?.title ?? prev.heroTitle,
        heroBody: homeSection?.body ?? prev.heroBody,
      }));
    }

    if (homeSection) {
      setProfileState((prev) => ({
        ...prev,
        heroTitle: homeSection.title,
        heroBody: homeSection.body,
      }));
    }

    if (!selectedSection && items.length > 0) {
      setSelectedSection(items[0]);
      setFormState({ title: items[0].title, body: items[0].body });
    }
  }

  async function loadBlogPosts() {
    const { data, error } = await fetchBlogPosts();

    if (error) {
      setMessage(error.message);
      return;
    }

    setBlogPosts(data ?? []);
  }

  async function loadNotes() {
    const { data, error } = await fetchNotes();

    if (error) {
      setMessage(error.message);
      return;
    }

    setNotes(data ?? []);
  }

  async function loadMessages() {
    const { data, error } = await fetchMessages();

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessages(data ?? []);
  }

  async function loadMetrics() {
    const { data, error } = await fetchPageMetrics();

    if (error) {
      setMessage(error.message);
      return;
    }

    setMetrics(data ?? []);
  }

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSignInError(null);
    setMessage(null);

    const { error } = await signInWithPassword(email, password);

    if (error) {
      setSignInError(error.message);
      return;
    }
  }

  async function handleSignOut() {
    await signOut();
    setSession(null);
  }

  async function handleSave() {
    if (!selectedSection) {
      return;
    }

    setSaving(true);
    setMessage(null);

    const { error } = await updateContentSection(selectedSection.id, {
      title: formState.title,
      body: formState.body,
    });

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Section updated successfully.");
    await loadSections();
  }

  async function handleSaveProfile() {
    setSaving(true);
    setMessage(null);

    const siteNameSection = sections.find((section) => section.type === "site_name");
    const homeSection = sections.find((section) => section.type === "home");

    if (siteNameSection) {
      await updateContentSection(siteNameSection.id, {
        title: profileState.siteName,
        body: profileState.sidebarAbout,
      });
    } else {
      await createContentSections([
        {
          type: "site_name",
          title: profileState.siteName,
          body: profileState.sidebarAbout || defaultContent.site_name.body,
        },
      ]);
    }

    if (homeSection) {
      await updateContentSection(homeSection.id, {
        title: profileState.heroTitle,
        body: profileState.heroBody,
      });
    }

    setSaving(false);
    setMessage("Profile and hero content saved.");
    await loadAllData();
  }

  async function handleCreateSection(type: ContentSectionType) {
    setSaving(true);
    setMessage(null);

    const { error } = await createContentSections([
      {
        type,
        title: defaultContent[type].title,
        body: defaultContent[type].body,
      },
    ]);

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(`Created ${type} section.`);
    await loadAllData();
  }

  async function handleDeleteSection() {
    if (!selectedSection) {
      return;
    }

    if (!window.confirm(`Delete the ${selectedSection.type} section? This cannot be undone.`)) {
      return;
    }

    setSaving(true);
    setMessage(null);

    const { error } = await deleteContentSection(selectedSection.id);

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setSelectedSection(null);
    setFormState({ title: "", body: "" });
    setMessage(`Deleted ${selectedSection.type} section.`);
    await loadAllData();
  }

  function handleSectionSelect(section: ContentSection) {
    setSelectedSection(section);
    setFormState({ title: section.title, body: section.body });
    setMessage(null);
  }

  function handleBlogSelect(blog: BlogPost) {
    setSelectedBlog(blog);
    setBlogState({
      title: blog.title,
      slug: blog.slug,
      body: blog.body,
      published: blog.published,
    });
    setMessage(null);
  }

  function handleNewBlog() {
    setSelectedBlog(null);
    setBlogState({ title: "", slug: "", body: "", published: true });
    setMessage(null);
  }

  function handleNoteSelect(note: Note) {
    setSelectedNote(note);
    setNoteState({ title: note.title, body: note.body });
    setMessage(null);
  }

  function handleNewNote() {
    setSelectedNote(null);
    setNoteState({ title: "", body: "" });
    setMessage(null);
  }

  async function handleSaveBlog() {
    if (!blogState.title.trim()) {
      setMessage("Blog title is required.");
      return;
    }

    setSaving(true);
    setMessage(null);

    if (selectedBlog) {
      const { error } = await updateBlogPost(selectedBlog.id, {
        title: blogState.title,
        slug: blogState.slug || slugify(blogState.title),
        body: blogState.body,
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
        body: blogState.body,
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

  async function handleDeleteBlog() {
    if (!selectedBlog) {
      return;
    }

    if (!window.confirm(`Delete the blog post “${selectedBlog.title}”?`)) {
      return;
    }

    setSaving(true);
    setMessage(null);

    const { error } = await deleteBlogPost(selectedBlog.id);

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setSelectedBlog(null);
    setBlogState({ title: "", slug: "", body: "", published: true });
    setMessage("Blog deleted.");
    await loadBlogPosts();
  }

  async function handleSaveNote() {
    if (!noteState.title.trim()) {
      setMessage("Note title is required.");
      return;
    }

    setSaving(true);
    setMessage(null);

    if (selectedNote) {
      const { error } = await updateNote(selectedNote.id, {
        title: noteState.title,
        body: noteState.body,
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
        body: noteState.body,
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

  async function handleDeleteNote() {
    if (!selectedNote) {
      return;
    }

    if (!window.confirm(`Delete the note “${selectedNote.title}”?`)) {
      return;
    }

    setSaving(true);
    setMessage(null);

    const { error } = await deleteNote(selectedNote.id);

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setSelectedNote(null);
    setNoteState({ title: "", body: "" });
    setMessage("Note deleted.");
    await loadNotes();
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-20 text-center text-muted-foreground">
        Loading admin panel…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24">
        <div className="rounded-3xl border border-border bg-card p-10 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Admin sign in
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight">Sign in to manage content</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Enter your email and password to sign in. The admin route is protected after sign in.
          </p>
          <form className="mt-8 space-y-4" onSubmit={handleSignIn}>
            <label className="block text-left text-sm font-semibold text-foreground">
              Email address
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/60 focus:ring-2 focus:ring-ring/30"
                placeholder="you@example.com"
              />
            </label>
            <label className="block text-left text-sm font-semibold text-foreground">
              Password
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                required
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/60 focus:ring-2 focus:ring-ring/30"
                placeholder="••••••••••••"
              />
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:bg-foreground/90"
              >
                Sign in
              </button>
            </div>
          </form>
          {signInError ? <p className="mt-4 text-sm text-destructive">{signInError}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-20">
      <div className="mb-8 rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Admin panel
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Site manager
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Edit your name, About Me, blog posts, notes, and watch page metrics from one
              dashboard.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-3xl border border-border bg-secondary p-5 text-sm text-muted-foreground sm:w-72">
            <div className="flex items-center gap-3 text-foreground">
              <User className="h-5 w-5" />
              <div>
                <div className="font-semibold">Admin</div>
                <div className="text-xs text-muted-foreground">{session.email}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:bg-foreground/90"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <Settings className="h-4 w-4" />
              Supabase content dashboard
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="space-y-4 rounded-3xl border border-border bg-secondary p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Content manager
              </p>
              <p className="text-sm text-muted-foreground">Pick a workspace to edit.</p>
            </div>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "bg-foreground text-background"
                    : "border border-border bg-background text-foreground hover:border-foreground/30"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </aside>

        <main className="space-y-8">
          {message ? (
            <div className="rounded-3xl border border-emerald-300/40 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              {message}
            </div>
          ) : null}

          {activeTab === "messages" ? (
            <section className="rounded-3xl border border-border bg-card p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Messages
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight">Contact messages</h2>
                </div>
                <div className="rounded-full border border-border bg-secondary px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Total: {messages.length}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="rounded-3xl border border-border bg-secondary p-5 text-sm text-muted-foreground">
                    No messages received yet.
                  </div>
                ) : (
                  messages.map((messageItem) => (
                    <div
                      key={messageItem.id}
                      className="rounded-3xl border border-border bg-background p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {messageItem.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{messageItem.email}</p>
                        </div>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          {new Date(messageItem.created_at).toLocaleString()}
                        </p>
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-foreground">
                        {messageItem.body}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          ) : null}

          {activeTab === "dashboard" ? (
            <section className="rounded-3xl border border-border bg-card p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Dashboard
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight">Traffic & activity</h2>
                </div>
                <div className="rounded-full border border-border bg-secondary px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Updated {metrics.length ? "from Supabase" : "once seeded"}{" "}
                  {githubLoading
                    ? "• GitHub loading"
                    : githubError
                      ? "• GitHub unavailable"
                      : "• GitHub loaded"}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-border bg-secondary p-6">
                  <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                    Blog posts
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-foreground">{blogPosts.length}</p>
                </div>
                <div className="rounded-3xl border border-border bg-secondary p-6">
                  <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Notes</p>
                  <p className="mt-3 text-3xl font-semibold text-foreground">{notes.length}</p>
                </div>
                <div className="rounded-3xl border border-border bg-secondary p-6">
                  <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                    Projects
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-foreground">
                    {githubLoading ? "…" : githubRepos.length}
                  </p>
                </div>
                <div className="rounded-3xl border border-border bg-secondary p-6">
                  <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                    Content blocks
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-foreground">{sections.length}</p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {metrics.map((metric) => (
                  <div key={metric.page} className="rounded-3xl border border-border bg-card p-6">
                    <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                      {metric.page}
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-foreground">{metric.views}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Last updated {new Date(metric.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {activeTab === "profile" ? (
            <section className="rounded-3xl border border-border bg-card p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Profile
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight">
                    Edit your site name and hero content
                  </h2>
                </div>
                <div className="rounded-full border border-border bg-secondary px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Sidebar + homepage
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <label className="block text-sm font-semibold text-foreground">
                  Site name
                  <input
                    value={profileState.siteName}
                    onChange={(event) =>
                      setProfileState((prev) => ({ ...prev, siteName: event.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/60 focus:ring-2 focus:ring-ring/30"
                  />
                </label>

                <label className="block text-sm font-semibold text-foreground">
                  Hero title
                  <input
                    value={profileState.heroTitle}
                    onChange={(event) =>
                      setProfileState((prev) => ({ ...prev, heroTitle: event.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/60 focus:ring-2 focus:ring-ring/30"
                  />
                </label>
              </div>

              <label className="mt-6 block text-sm font-semibold text-foreground">
                Sidebar about text
                <textarea
                  value={profileState.sidebarAbout}
                  onChange={(event) =>
                    setProfileState((prev) => ({ ...prev, sidebarAbout: event.target.value }))
                  }
                  rows={4}
                  placeholder="I'm Divyanshu, software engineer and open-source creator. This is my digital garden."
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/60 focus:ring-2 focus:ring-ring/30"
                />
              </label>

              <label className="mt-6 block text-sm font-semibold text-foreground">
                Hero body
                <textarea
                  value={profileState.heroBody}
                  onChange={(event) =>
                    setProfileState((prev) => ({ ...prev, heroBody: event.target.value }))
                  }
                  rows={8}
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/60 focus:ring-2 focus:ring-ring/30"
                />
              </label>

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Save profile
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </section>
          ) : null}

          {activeTab === "blog" ? (
            <section className="rounded-3xl border border-border bg-card p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Blog
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight">Create and edit posts</h2>
                </div>
                <button
                  type="button"
                  onClick={handleNewBlog}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition hover:border-foreground/30"
                >
                  <Plus className="h-4 w-4" />
                  New post
                </button>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                <div className="space-y-3">
                  {blogPosts.length === 0 ? (
                    <div className="rounded-3xl border border-border bg-secondary p-5 text-sm text-muted-foreground">
                      No blog posts yet. Create the first one using the editor.
                    </div>
                  ) : (
                    blogPosts.map((post) => (
                      <button
                        key={post.id}
                        type="button"
                        onClick={() => handleBlogSelect(post)}
                        className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                          selectedBlog?.id === post.id
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:bg-secondary"
                        }`}
                      >
                        <div className="font-semibold text-foreground">{post.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {post.slug} · {post.published ? "Published" : "Draft"}
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground">
                    Title
                    <input
                      value={blogState.title}
                      onChange={(event) =>
                        setBlogState((prev) => ({ ...prev, title: event.target.value }))
                      }
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/60 focus:ring-2 focus:ring-ring/30"
                    />
                  </label>

                  <label className="mt-4 block text-sm font-semibold text-foreground">
                    Slug
                    <input
                      value={blogState.slug}
                      onChange={(event) =>
                        setBlogState((prev) => ({ ...prev, slug: event.target.value }))
                      }
                      placeholder="auto-generated from title"
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/60 focus:ring-2 focus:ring-ring/30"
                    />
                  </label>

                  <label className="mt-4 block text-sm font-semibold text-foreground">Body</label>
                  <div className="mt-2 rounded-2xl border border-border bg-background p-4">
                    <div className="rounded-2xl border border-border/80 bg-background p-3">
                      <div className="flex flex-wrap gap-2 rounded-2xl bg-secondary/70 p-2">
                        <button
                          type="button"
                          onClick={() => editor?.chain().focus().toggleBold().run()}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                            editor?.isActive("bold")
                              ? "border-foreground bg-foreground/10 text-foreground"
                              : "border-border bg-background text-muted-foreground hover:border-foreground/30"
                          }`}
                        >
                          Bold
                        </button>
                        <button
                          type="button"
                          onClick={() => editor?.chain().focus().toggleItalic().run()}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                            editor?.isActive("italic")
                              ? "border-foreground bg-foreground/10 text-foreground"
                              : "border-border bg-background text-muted-foreground hover:border-foreground/30"
                          }`}
                        >
                          Italic
                        </button>
                        <button
                          type="button"
                          onClick={() => editor?.chain().focus().toggleUnderline().run()}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                            editor?.isActive("underline")
                              ? "border-foreground bg-foreground/10 text-foreground"
                              : "border-border bg-background text-muted-foreground hover:border-foreground/30"
                          }`}
                        >
                          Underline
                        </button>
                        <button
                          type="button"
                          onClick={() => editor?.chain().focus().toggleStrike().run()}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                            editor?.isActive("strike")
                              ? "border-foreground bg-foreground/10 text-foreground"
                              : "border-border bg-background text-muted-foreground hover:border-foreground/30"
                          }`}
                        >
                          Strike
                        </button>
                        <button
                          type="button"
                          onClick={() => editor?.chain().focus().toggleBulletList().run()}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                            editor?.isActive("bulletList")
                              ? "border-foreground bg-foreground/10 text-foreground"
                              : "border-border bg-background text-muted-foreground hover:border-foreground/30"
                          }`}
                        >
                          Bullet
                        </button>
                        <button
                          type="button"
                          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                            editor?.isActive("orderedList")
                              ? "border-foreground bg-foreground/10 text-foreground"
                              : "border-border bg-background text-muted-foreground hover:border-foreground/30"
                          }`}
                        >
                          Numbered
                        </button>
                        <button
                          type="button"
                          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                            editor?.isActive("blockquote")
                              ? "border-foreground bg-foreground/10 text-foreground"
                              : "border-border bg-background text-muted-foreground hover:border-foreground/30"
                          }`}
                        >
                          Quote
                        </button>
                        <button
                          type="button"
                          onClick={() => editor?.chain().focus().setHardBreak().run()}
                          className="rounded-full border border-border px-3 py-1 text-xs font-medium transition hover:border-foreground/30"
                        >
                          Break
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const url = window.prompt("Enter link URL");
                            if (url) {
                              editor?.chain().focus().setLink({ href: url }).run();
                            }
                          }}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                            editor?.isActive("link")
                              ? "border-foreground bg-foreground/10 text-foreground"
                              : "border-border bg-background text-muted-foreground hover:border-foreground/30"
                          }`}
                        >
                          Link
                        </button>
                      </div>
                      <div className="mt-4 h-px bg-border" />
                      <div className="mt-3 min-h-[520px] rounded-2xl bg-background p-4 text-sm text-foreground">
                        <EditorContent
                          editor={editor}
                          className="min-h-[460px] w-full rounded-2xl bg-background px-2 py-3 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <label className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                    <input
                      type="checkbox"
                      checked={blogState.published}
                      onChange={(event) =>
                        setBlogState((prev) => ({ ...prev, published: event.target.checked }))
                      }
                      className="h-4 w-4 rounded border border-border bg-background text-foreground"
                    />
                    Published
                  </label>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleSaveBlog}
                      disabled={saving}
                      className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Save post
                    </button>
                    {selectedBlog ? (
                      <button
                        type="button"
                        onClick={handleDeleteBlog}
                        disabled={saving}
                        className="inline-flex items-center justify-center rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:border-foreground/30 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {activeTab === "notes" ? (
            <section className="rounded-3xl border border-border bg-card p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Notes
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight">
                    Create and manage notes
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleNewNote}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition hover:border-foreground/30"
                >
                  <Plus className="h-4 w-4" />
                  New note
                </button>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                <div className="space-y-3">
                  {notes.length === 0 ? (
                    <div className="rounded-3xl border border-border bg-secondary p-5 text-sm text-muted-foreground">
                      No notes yet. Use the editor to add your first note.
                    </div>
                  ) : (
                    notes.map((note) => (
                      <button
                        key={note.id}
                        type="button"
                        onClick={() => handleNoteSelect(note)}
                        className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                          selectedNote?.id === note.id
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:bg-secondary"
                        }`}
                      >
                        <div className="font-semibold text-foreground">{note.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {new Date(note.updated_at).toLocaleDateString()}
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground">
                    Title
                    <input
                      value={noteState.title}
                      onChange={(event) =>
                        setNoteState((prev) => ({ ...prev, title: event.target.value }))
                      }
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/60 focus:ring-2 focus:ring-ring/30"
                    />
                  </label>

                  <label className="mt-4 block text-sm font-semibold text-foreground">Body</label>
                  <div className="mt-4 rounded-2xl border border-border bg-secondary/70 p-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          toggleWrapper(
                            noteTextareaRef.current,
                            noteState.body,
                            (value) => setNoteState((prev) => ({ ...prev, body: value })),
                            "**",
                          )
                        }
                        className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-foreground/30"
                      >
                        Bold
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          toggleWrapper(
                            noteTextareaRef.current,
                            noteState.body,
                            (value) => setNoteState((prev) => ({ ...prev, body: value })),
                            "*",
                          )
                        }
                        className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-foreground/30"
                      >
                        Italic
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          toggleWrapper(
                            noteTextareaRef.current,
                            noteState.body,
                            (value) => setNoteState((prev) => ({ ...prev, body: value })),
                            "__",
                          )
                        }
                        className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-foreground/30"
                      >
                        Underline
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          toggleWrapper(
                            noteTextareaRef.current,
                            noteState.body,
                            (value) => setNoteState((prev) => ({ ...prev, body: value })),
                            "~~",
                          )
                        }
                        className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-foreground/30"
                      >
                        Strike
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          togglePrefix(
                            noteTextareaRef.current,
                            noteState.body,
                            (value) => setNoteState((prev) => ({ ...prev, body: value })),
                            "- ",
                          )
                        }
                        className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-foreground/30"
                      >
                        Bullet
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          togglePrefix(
                            noteTextareaRef.current,
                            noteState.body,
                            (value) => setNoteState((prev) => ({ ...prev, body: value })),
                            "1. ",
                          )
                        }
                        className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-foreground/30"
                      >
                        Numbered
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          togglePrefix(
                            noteTextareaRef.current,
                            noteState.body,
                            (value) => setNoteState((prev) => ({ ...prev, body: value })),
                            "> ",
                          )
                        }
                        className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-foreground/30"
                      >
                        Quote
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          insertLink(noteTextareaRef.current, noteState.body, (value) =>
                            setNoteState((prev) => ({ ...prev, body: value })),
                          )
                        }
                        className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-foreground/30"
                      >
                        Link
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 h-px bg-border" />
                  <textarea
                    ref={noteTextareaRef}
                    value={noteState.body}
                    onChange={(event) =>
                      setNoteState((prev) => ({ ...prev, body: event.target.value }))
                    }
                    rows={12}
                    className="mt-4 w-full min-h-[320px] rounded-2xl border border-border bg-background px-4 py-4 text-sm text-foreground outline-none transition-colors focus:border-foreground/60 focus:ring-2 focus:ring-ring/30"
                  />

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleSaveNote}
                      disabled={saving}
                      className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Save note
                    </button>
                    {selectedNote ? (
                      <button
                        type="button"
                        onClick={handleDeleteNote}
                        disabled={saving}
                        className="inline-flex items-center justify-center rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:border-foreground/30 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}
