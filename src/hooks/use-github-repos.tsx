import { useEffect, useState } from "react";

export type GitHubRepo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  updated_at: string;
  stargazers_count: number;
};

export function useGithubRepos(username: string, perPage = 50) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadRepos() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=${perPage}`);
        if (!mounted) return;

        if (!response.ok) {
          const text = await response.text();
          setError(`GitHub fetch failed ${response.status}: ${text}`);
          setLoading(false);
          return;
        }

        const data = await response.json();
        const normalized = Array.isArray(data)
          ? data.map((repo: any) => ({
              id: repo.id,
              name: repo.name,
              html_url: repo.html_url,
              description: repo.description,
              homepage: repo.homepage,
              language: repo.language,
              updated_at: repo.updated_at,
              stargazers_count: repo.stargazers_count,
            }))
          : [];

        setRepos(normalized);
      } catch (fetchError) {
        if (!mounted) return;
        setError(fetchError instanceof Error ? fetchError.message : String(fetchError));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadRepos();

    return () => {
      mounted = false;
    };
  }, [username, perPage]);

  return { repos, loading, error };
}
