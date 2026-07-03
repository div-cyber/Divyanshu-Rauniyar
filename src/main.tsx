import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import "katex/dist/katex.min.css";
import Loader from "./components/loader";
import { fetchContentSections, fetchBlogPosts, fetchNotes, fetchMessages } from "./lib/supabase";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root container not found");
}

function AppWithPreload() {
  const [loading, setLoading] = useState(true);
  const minShowMs = 1500; // minimum loader display time in ms
  const startTime = performance.now();

  useEffect(() => {
    let mounted = true;

    async function preload() {
      try {
        // wait for fonts
        const fontsReady = (document as any).fonts
          ? (document as any).fonts.ready
          : Promise.resolve();

        // wait for stylesheets to load
        const sheets = Array.from(
          document.querySelectorAll('link[rel="stylesheet"]'),
        ) as HTMLLinkElement[];
        const sheetPromises = sheets.map((link) => {
          return new Promise<void>((resolve) => {
            if (!link.sheet) {
              link.addEventListener("load", () => resolve(), { once: true });
              // small timeout fallback
              setTimeout(() => resolve(), 2000);
            } else {
              resolve();
            }
          });
        });

        const windowLoad = new Promise<void>((resolve) => {
          if (document.readyState === "complete") return resolve();
          window.addEventListener("load", () => resolve(), { once: true });
        });

        // preload initial data used across the site
        await Promise.all([
          fontsReady,
          Promise.all(sheetPromises),
          windowLoad,
          fetchContentSections(),
          fetchBlogPosts(),
          fetchNotes(),
          fetchMessages(),
        ]);
      } catch (e) {
        console.warn("preload failed", e);
      }

      if (mounted) {
        // ensure loader stays visible at least `minShowMs`
        try {
          const elapsed = performance.now() - startTime;
          if (elapsed < minShowMs) {
            await new Promise((r) => setTimeout(r, Math.round(minShowMs - elapsed)));
          }
        } catch (err) {
          /* ignore */
        }
        setLoading(false);
      }
    }

    preload();

    return () => {
      mounted = false;
    };
  }, []);

  const [exiting, setExiting] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    if (!loading) {
      // Start exit animation and then hide loader
      setExiting(true);
      const t = setTimeout(() => {
        setShowLoader(false);
      }, 500);
      return () => clearTimeout(t);
    }
    return;
  }, [loading]);

  if (showLoader) {
    // While loader visible, do not render the app content underneath.
    return <Loader exiting={exiting} />;
  }

  return <App />;
}

createRoot(container).render(
  <React.StrictMode>
    <AppWithPreload />
  </React.StrictMode>,
);
