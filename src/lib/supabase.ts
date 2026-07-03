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

// Cache stores
let blogPostsCache: BlogPost[] | null = null;
let notesCache: Note[] | null = null;
let contentSectionsCache: ContentSection[] | null = null;

// Invalidate cache functions
export function invalidateBlogPostsCache() {
  blogPostsCache = null;
}

export function invalidateNotesCache() {
  notesCache = null;
}

export function invalidateContentSectionsCache() {
  contentSectionsCache = null;
}

// Preload all data
export async function preloadAllData() {
  try {
    const [postsResult, notesResult, sectionsResult] = await Promise.all([
      fetchBlogPosts(),
      fetchNotes(),
      fetchContentSections(),
    ]);

    if (!postsResult.error && postsResult.data) {
      blogPostsCache = postsResult.data;
    }
    if (!notesResult.error && notesResult.data) {
      notesCache = notesResult.data;
    }
    if (!sectionsResult.error && sectionsResult.data) {
      contentSectionsCache = sectionsResult.data;
    }
  } catch (e) {
    console.error("Error preloading data:", e);
  }
}

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
  if (contentSectionsCache) {
    const section = contentSectionsCache.find(s => s.type === type);
    if (section) {
      return { data: section, error: null };
    }
  }
  const result = await supabase
    .from("content_sections")
    .select("id, type, title, body")
    .eq("type", type)
    .maybeSingle<ContentSection>();
  return result;
}

export async function fetchContentSections() {
  if (contentSectionsCache) {
    return { data: contentSectionsCache, error: null };
  }
  const result = await supabase
    .from("content_sections")
    .select("id, type, title, body")
    .order("type", { ascending: true });
  if (!result.error && result.data) {
    contentSectionsCache = result.data;
  }
  return result;
}

export async function updateContentSection(
  id: number,
  updates: Partial<Pick<ContentSection, "title" | "body">>,
) {
  const result = await supabase.from("content_sections").update(updates).eq("id", id);
  invalidateContentSectionsCache();
  return result;
}

export async function createContentSections(
  entries: Array<Omit<ContentSection, "id" | "created_at">>,
) {
  const result = await supabase.from("content_sections").insert(entries).select("id, type, title, body");
  invalidateContentSectionsCache();
  return result;
}

export async function deleteContentSection(id: number) {
  const result = await supabase.from("content_sections").delete().eq("id", id);
  invalidateContentSectionsCache();
  return result;
}

export async function fetchBlogPosts() {
  if (blogPostsCache) {
    return { data: blogPostsCache, error: null };
  }
  const result = await supabase
    .from("blog_posts")
    .select("id, slug, title, body, published, created_at, updated_at")
    .order("updated_at", { ascending: false });
  if (!result.error && result.data) {
    blogPostsCache = result.data;
  }
  return result;
}

export async function fetchBlogPostBySlug(slug: string) {
  if (blogPostsCache) {
    const post = blogPostsCache.find(p => p.slug === slug);
    if (post) {
      return { data: post, error: null };
    }
  }
  const result = await supabase
    .from("blog_posts")
    .select("id, slug, title, body, published, created_at, updated_at")
    .eq("slug", slug)
    .maybeSingle<BlogPost>();
  return result;
}

export async function createBlogPost(post: Omit<BlogPost, "id" | "created_at" | "updated_at">) {
  const result = await supabase
    .from("blog_posts")
    .insert(post)
    .select("id, slug, title, body, published, created_at, updated_at");
  invalidateBlogPostsCache();
  return result;
}

export async function updateBlogPost(
  id: number,
  updates: Partial<Omit<BlogPost, "id" | "created_at" | "updated_at">>,
) {
  const result = await supabase
    .from("blog_posts")
    .update(updates)
    .eq("id", id)
    .select("id, slug, title, body, published, created_at, updated_at");
  invalidateBlogPostsCache();
  return result;
}

export async function deleteBlogPost(id: number) {
  const result = await supabase.from("blog_posts").delete().eq("id", id);
  invalidateBlogPostsCache();
  return result;
}

export async function fetchNotes() {
  if (notesCache) {
    return { data: notesCache, error: null };
  }
  const result = await supabase
    .from("notes")
    .select("id, title, body, created_at, updated_at")
    .order("updated_at", { ascending: false });
  if (!result.error && result.data) {
    notesCache = result.data;
  }
  return result;
}

export async function fetchNoteById(id: number) {
  if (notesCache) {
    const note = notesCache.find(n => n.id === id);
    if (note) {
      return { data: note, error: null };
    }
  }
  const result = await supabase
    .from("notes")
    .select("id, title, body, created_at, updated_at")
    .eq("id", id)
    .maybeSingle<Note>();
  return result;
}

export async function createNote(note: Omit<Note, "id" | "created_at" | "updated_at">) {
  const result = await supabase.from("notes").insert(note).select("id, title, body, created_at, updated_at");
  invalidateNotesCache();
  return result;
}

export async function updateNote(
  id: number,
  updates: Partial<Omit<Note, "id" | "created_at" | "updated_at">>,
) {
  const result = await supabase
    .from("notes")
    .update(updates)
    .eq("id", id)
    .select("id, title, body, created_at, updated_at");
  invalidateNotesCache();
  return result;
}

export async function deleteNote(id: number) {
  const result = await supabase.from("notes").delete().eq("id", id);
  invalidateNotesCache();
  return result;
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

export async function uploadImage(file: File, bucketName = "images"): Promise<string | null> {
  console.log("Starting image upload:", file.name);
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  console.log("Generated filename:", fileName);

  const { data, error } = await supabase.storage.from(bucketName).upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    console.error("Error uploading image:", error);
    alert(`Error uploading image: ${error.message}`);
    return null;
  }

  console.log("Upload successful:", data);
  const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(data.path);
  console.log("Public URL:", urlData.publicUrl);

  return urlData.publicUrl;
}
