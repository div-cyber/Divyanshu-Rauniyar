import { Outlet, useLocation } from "react-router-dom";

import { SiteNav } from "../components/site-nav";
import { SiteFooter } from "../components/site-footer";
import { ThemeScript } from "../components/theme-script";

export function RootLayout() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
      <ThemeScript />
      <div className="min-h-screen bg-background text-foreground">
        <div className="relative min-h-screen">
          {!isAdminPage && <SiteNav />}
          <main
            className={`${isAdminPage ? "h-screen" : "ml-[280px] h-screen"} overflow-y-auto bg-background`}
          >
            <div
              className={`min-h-screen border-border/10 bg-background px-6 py-10 md:px-10 lg:px-14 ${isAdminPage ? "" : "border-l"}`}
            >
              <Outlet />
              <SiteFooter />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
