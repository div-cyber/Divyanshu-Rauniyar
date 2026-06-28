import { useEffect, useState } from "react";
import {
  ContentSection,
  ContentSectionType,
  fetchContentSection,
} from "../lib/supabase";

export function useContentSection(type: ContentSectionType) {
  const [section, setSection] = useState<ContentSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data, error } = await fetchContentSection(type);

      if (!mounted) {
        return;
      }

      if (error) {
        setError(error.message);
      } else {
        setSection(data ?? null);
      }

      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [type]);

  return { section, loading, error };
}
