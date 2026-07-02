import { Link, NavLink } from "react-router-dom";
import { ThemeToggle } from "./theme-toggle";
import { useContentSection } from "../hooks/use-content-section";
import { Instagram, Linkedin, Mail, X, Facebook, Github, X as Close } from "lucide-react";

const links = [
  { to: "/blog", label: "Blog" },
  { to: "/notes", label: "Notes" },
  { to: "/projects", label: "Projects" },
  { to: "/about", label: "About Me" },
] as const;

const socialLinks = [
  { href: "https://www.instagram.com/div_yanshu22/?hl=en", label: "Instagram", Icon: Instagram },
  { href: "https://www.linkedin.com/in/div-yanshu-505839323/", label: "LinkedIn", Icon: Linkedin },
  { href: "mailto:yanshudiv22@gmail.com", label: "Email", Icon: Mail },
  { href: "https://x.com/Div_Yanshu22", label: "X", Icon: X },
  { href: "https://www.facebook.com/div.yanshu.1675275", label: "Facebook", Icon: Facebook },
  { href: "https://github.com/div-cyber", label: "GitHub", Icon: Github },
] as const;

interface SiteNavProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function SiteNav({ isOpen, onClose }: SiteNavProps) {
  const { section: siteNameSection } = useContentSection("site_name");
  const siteName = siteNameSection?.title ?? "Divyanshu Rauniyar";
  const sidebarAbout =
    siteNameSection?.body ??
    "I'm Divyanshu, software engineer and open-source creator. This is my digital garden.";

  const handleMailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose?.();
    window.open("https://mail.google.com/mail/?view=cm&fs=1&to=yanshudiv22@gmail.com", "_blank");
  };

  const handleLinkClick = () => {
    onClose?.();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      <aside
        className={`
        fixed top-0 z-50 h-screen w-[280px] overflow-y-auto border-r border-border/50 bg-background px-6 py-8 text-foreground
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Link
                to="/"
                onClick={handleLinkClick}
                className="text-2xl font-semibold tracking-tight text-foreground hover:text-foreground/80"
              >
                {siteName}
              </Link>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-secondary">
                  <Close className="h-5 w-5" />
                </button>
              </div>
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
                onClick={handleLinkClick}
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
              {socialLinks.map((social) => (
                <li key={social.href}>
                  {social.href.startsWith("mailto") ? (
                    <button
                      onClick={handleMailClick}
                      className="flex items-center gap-3 hover:text-foreground transition w-full text-left"
                    >
                      <social.Icon className="w-4 h-4" />
                      {social.label}
                    </button>
                  ) : (
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      onClick={handleLinkClick}
                      className="flex items-center gap-3 hover:text-foreground transition"
                    >
                      <social.Icon className="w-4 h-4" />
                      {social.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
}
