import { AuthChangeEvent, Session, createClient } from "@supabase/supabase-js";

export const sectionTypes = ["site_name", "home", "about", "blog", "notes", "projects"] as const;
export type SectionType = (typeof sectionTypes)[number];

export type ContentSectionType = SectionType;

export type ContentSection = {
  id: number;
  type: ContentSectionType;
  title: string;
  body: string;
  created_at?: string;
};

export type BlogPost = {
  id: number;
  slug: string;
  title: string;
  body: string;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Note = {
  id: number;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: number;
  name: string;
  email: string;
  body: string;
  created_at: string;
};

export type PageMetric = {
  id: number;
  page: string;
  views: number;
  updated_at: string;
};

export const defaultContent: Record<SectionType, { title: string; body: string }> = {
  site_name: {
    title: "Divyanshu Rauniyar",
    body: "The name shown in the sidebar and hero section.",
  },
  home: {
    title: "Hello, I'm Divyanshu.",
    body: "I build thoughtful software, AI products, and studio-led tooling from Nepal. This section is managed from Supabase.",
  },
  about: {
    title: "About me",
    body: "I'm a full-stack developer and AI engineer building deliberate digital experiences. The About page content is controlled from the admin panel.",
  },
  blog: {
    title: "Blog",
    body: "A new long-form series on shipping AI products is being drafted. Update this landing copy from the admin dashboard.",
  },
  notes: {
    title: "Notes",
    body: "Snippets, commands, cheatsheets, and reading notes will live here. Update this landing copy from the admin dashboard.",
  },
  projects: {
    title: "Projects",
    body: "A selection of work and experiments. The introduction text here is controlled by content managed in Supabase.",
  },
};

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export async function getCurrentSession() {
  return supabase.auth.getSession();
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, authSession: Session | null) => void,
) {
  return supabase.auth.onAuthStateChange(callback);
}

export async function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function fetchContentSection(type: ContentSectionType) {
  return supabase
    .from("content_sections")
    .select("id, type, title, body")
    .eq("type", type)
    .maybeSingle<ContentSection>();
}

export async function fetchContentSections() {
  return supabase
    .from("content_sections")
    .select("id, type, title, body")
    .order("type", { ascending: true });
}

export async function updateContentSection(
  id: number,
  updates: Partial<Pick<ContentSection, "title" | "body">>,
) {
  return supabase.from("content_sections").update(updates).eq("id", id);
}

export async function createContentSections(
  entries: Array<Omit<ContentSection, "id" | "created_at">>,
) {
  return supabase.from("content_sections").insert(entries).select("id, type, title, body");
}

export async function deleteContentSection(id: number) {
  return supabase.from("content_sections").delete().eq("id", id);
}

export async function fetchBlogPosts() {
  return supabase
    .from("blog_posts")
    .select("id, slug, title, body, published, created_at, updated_at")
    .order("updated_at", { ascending: false });
}

export async function fetchBlogPostBySlug(slug: string) {
  return supabase
    .from("blog_posts")
    .select("id, slug, title, body, published, created_at, updated_at")
    .eq("slug", slug)
    .maybeSingle<BlogPost>();
}

export async function createBlogPost(post: Omit<BlogPost, "id" | "created_at" | "updated_at">) {
  return supabase
    .from("blog_posts")
    .insert(post)
    .select("id, slug, title, body, published, created_at, updated_at");
}

export async function updateBlogPost(
  id: number,
  updates: Partial<Omit<BlogPost, "id" | "created_at" | "updated_at">>,
) {
  return supabase
    .from("blog_posts")
    .update(updates)
    .eq("id", id)
    .select("id, slug, title, body, published, created_at, updated_at");
}

export async function deleteBlogPost(id: number) {
  return supabase.from("blog_posts").delete().eq("id", id);
}

export async function fetchNotes() {
  return supabase
    .from("notes")
    .select("id, title, body, created_at, updated_at")
    .order("updated_at", { ascending: false });
}

export async function fetchNoteById(id: number) {
  return supabase
    .from("notes")
    .select("id, title, body, created_at, updated_at")
    .eq("id", id)
    .maybeSingle<Note>();
}

export async function createNote(note: Omit<Note, "id" | "created_at" | "updated_at">) {
  return supabase.from("notes").insert(note).select("id, title, body, created_at, updated_at");
}

export async function updateNote(
  id: number,
  updates: Partial<Omit<Note, "id" | "created_at" | "updated_at">>,
) {
  return supabase
    .from("notes")
    .update(updates)
    .eq("id", id)
    .select("id, title, body, created_at, updated_at");
}

export async function deleteNote(id: number) {
  return supabase.from("notes").delete().eq("id", id);
}

export async function fetchMessages() {
  return supabase
    .from("messages")
    .select("id, name, email, body, created_at")
    .order("created_at", { ascending: false });
}

export async function createMessage(message: Omit<Message, "id" | "created_at">) {
  return supabase.from("messages").insert(message).select("id, name, email, body, created_at");
}

export async function fetchPageMetrics() {
  return supabase
    .from("page_metrics")
    .select("id, page, views, updated_at")
    .order("page", { ascending: true });
}

export async function incrementPageMetric(page: string, amount = 1) {
  const { data, error } = await supabase
    .from("page_metrics")
    .select("id, views")
    .eq("page", page)
    .maybeSingle<PageMetric>();

  if (error) {
    return { data: null, error };
  }

  if (data) {
    return supabase
      .from("page_metrics")
      .update({ views: data.views + amount, updated_at: new Date().toISOString() })
      .eq("id", data.id)
      .select("id, page, views, updated_at");
  }

  return supabase
    .from("page_metrics")
    .insert({ page, views: amount, updated_at: new Date().toISOString() })
    .select("id, page, views, updated_at");
}
