import { Link, NavLink } from "react-router-dom";
import { ThemeToggle } from "./theme-toggle";
import { useContentSection } from "../hooks/use-content-section";

const links = [
  { to: "/blog", label: "Blog" },
  { to: "/notes", label: "Notes" },
  { to: "/projects", label: "Projects" },
  { to: "/about", label: "About Me" },
] as const;

export function SiteNav() {
  const { section: siteNameSection } = useContentSection("site_name");
  const siteName = siteNameSection?.title ?? "Divyanshu Rauniyar";
  const sidebarAbout = siteNameSection?.body ?? "I'm Divyanshu, software engineer and open-source creator. This is my digital garden.";

  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-[260px] overflow-y-auto border-r border-border/50 bg-background px-6 py-8 text-foreground">
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="text-2xl font-semibold tracking-tight text-foreground hover:text-foreground/80">
              {siteName}
            </Link>
            <ThemeToggle />
          </div>
          <hr className="border-border/80" />
        </div>

        <div className="space-y-3 text-sm leading-7 text-foreground">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">About Me</p>
          <p>{sidebarAbout}</p>
          <hr className="border-border/80" />
        </div>

        <nav className="space-y-2 text-sm text-foreground">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `block px-3 py-2 transition ${isActive ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="pt-4 text-sm text-muted-foreground">
          <hr className="border-border/80" />
          <p className="mt-4 uppercase tracking-[0.24em]">Stay Connected</p>
          <ul className="mt-3 space-y-2">
            <li>
              <a href="mailto:hello@blackbyte.dev" className="block">Email signup</a>
            </li>
            <li>
              <a href="https://bsky.app/" target="_blank" rel="noreferrer" className="block">Bluesky</a>
            </li>
            <li>
              <a href="/rss.xml" className="block">RSS feed</a>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
