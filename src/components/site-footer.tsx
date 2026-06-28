import { Link } from "react-router-dom";
import { Github, Linkedin, Twitter, Instagram, Mail } from "lucide-react";

const social = [
  { href: "https://github.com/", label: "GitHub", Icon: Github },
  { href: "https://linkedin.com/", label: "LinkedIn", Icon: Linkedin },
  { href: "https://twitter.com/", label: "Twitter", Icon: Twitter },
  { href: "https://instagram.com/", label: "Instagram", Icon: Instagram },
  { href: "mailto:hello@blackbyte.dev", label: "Email", Icon: Mail },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="mx-auto grid max-w-5xl gap-10 px-5 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-bold tracking-tight">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background text-xs font-black">
              B
            </span>
            <span className="text-sm uppercase tracking-[0.18em]">Blackbyte</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Built and maintained by Divyanshu Rauniyar from Nepal. Software, AI, and notes from the field.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Site</h4>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {[
              ["/blog", "Blog"],
              ["/notes", "Notes"],
              ["/projects", "Projects"],
              ["/about", "About Me"],
              ["/uses", "Uses"],
              ["/now", "Now"],
              ["/contact", "Contact"],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="nav-link">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Elsewhere</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {social.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-secondary hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-2 px-5 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Divyanshu Rauniyar. All rights reserved.</p>
          <p>Made with care in Kathmandu, Nepal.</p>
        </div>
      </div>
    </footer>
  );
}
