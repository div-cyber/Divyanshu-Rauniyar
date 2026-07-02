import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

import { SiteNav } from "../components/site-nav";
import { SiteFooter } from "../components/site-footer";
import { ThemeScript } from "../components/theme-script";

export function RootLayout() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <ThemeScript />
      <div className="min-h-screen bg-background text-foreground">
        <div className="relative min-h-screen">
          {!isAdminPage && (
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

              <SiteNav 
                isOpen={isMobileMenuOpen} 
                onClose={() => setIsMobileMenuOpen(false)} 
              />
            </>
          )}
          
          <main
            className={`
              ${isAdminPage ? "h-screen" : "h-screen lg:ml-[280px]"} 
              overflow-y-auto bg-background
              pt-16 lg:pt-0
            `}
          >
            <div
              className={`
                min-h-screen 
                border-border/10 bg-background 
                px-4 sm:px-6 py-8 md:px-10 lg:px-14
                ${isAdminPage ? "" : "border-l"}
              `}
            >
              <Outlet />
              {!isAdminPage && <SiteFooter />}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
