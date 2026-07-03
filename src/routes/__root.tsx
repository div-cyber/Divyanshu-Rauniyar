import { useState, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

import { SiteNav } from "../components/site-nav";
import { SiteFooter } from "../components/site-footer";
import { ThemeScript } from "../components/theme-script";

export function RootLayout() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");
  const isBlogEditorPage = location.pathname.startsWith("/blog-editor");
  const isNoteEditorPage = location.pathname.startsWith("/note-editor");
  const isBlogPostPage = location.pathname.startsWith("/blog/") && location.pathname !== "/blog"; // single blog post page
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      if (location.hash) {
        // For hash links, scroll directly to the element in main container
        const elementId = location.hash.slice(1);
        const element = document.getElementById(elementId);
        if (element) {
          // Use requestAnimationFrame to make sure DOM is ready
          requestAnimationFrame(() => {
            if (mainRef.current) {
              const containerRect = mainRef.current.getBoundingClientRect();
              const elementRect = element.getBoundingClientRect();
              const containerHeight = containerRect.height;
              const elementHeight = elementRect.height;
              
              // Calculate scroll position to center the element in viewport
              const scrollPosition = mainRef.current.scrollTop + (elementRect.top - containerRect.top) - (containerHeight / 2) + (elementHeight / 2);
              
              mainRef.current.scrollTo({
                top: Math.max(0, scrollPosition),
                left: 0,
                behavior: "smooth"
              });
            }
          });
        }
      } else {
        // For regular links, just scroll to top immediately (no smooth)
        mainRef.current.scrollTop = 0;
      }
    }
  }, [location]);

  return (
    <>
      <ThemeScript />
      <div className="min-h-screen bg-background text-foreground">
        <div className="relative min-h-screen">
          {!isAdminPage && !isBlogEditorPage && !isNoteEditorPage && !isBlogPostPage && (
            <>
              {/* Mobile Hamburger Button */}
              <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-background border-b border-border/50 px-4 py-3 flex items-center justify-between">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded hover:bg-secondary"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </div>

              <SiteNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
            </>
          )}

          <main
            ref={mainRef}
            className={`
              ${isAdminPage || isBlogEditorPage || isNoteEditorPage || isBlogPostPage ? "h-screen" : "h-screen lg:ml-[280px]"} 
              overflow-y-auto bg-background
              pt-16 lg:pt-0
            `}
          >
            <div
              className={`
                min-h-screen 
                border-border/10 bg-background 
                px-4 sm:px-6 py-8 md:px-10 lg:px-14
                ${isAdminPage || isBlogEditorPage || isNoteEditorPage || isBlogPostPage ? "" : "border-l"}
              `}
            >
              <Outlet />
              {!isAdminPage && !isBlogEditorPage && !isNoteEditorPage && !isBlogPostPage && (
                <SiteFooter />
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
