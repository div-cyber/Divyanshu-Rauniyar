import { Github, Linkedin, X, Instagram, Mail, Facebook } from "lucide-react";

const row1 = [
  {
    href: "https://www.instagram.com/div_yanshu22/?hl=en",
    label: "Instagram",
    username: "@div_yanshu22",
    Icon: Instagram,
  },
  {
    href: "https://www.linkedin.com/in/div-yanshu-505839323/",
    label: "LinkedIn",
    username: "Div Yanshu",
    Icon: Linkedin,
  },
  {
    href: "https://www.facebook.com/div.yanshu.1675275",
    label: "Facebook",
    username: "Div Yanshu",
    Icon: Facebook,
  },
];
const row2 = [
  { href: "https://github.com/div-cyber", label: "GitHub", username: "div-cyber", Icon: Github },
  { href: "https://x.com/Div_Yanshu22", label: "X", username: "@Div_Yanshu22", Icon: X },
  {
    href: "mailto:yanshudiv22@gmail.com",
    label: "Email",
    username: "yanshudiv22@gmail.com",
    Icon: Mail,
  },
];

export function SiteFooter() {
  const handleMailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open("https://mail.google.com/mail/?view=cm&fs=1&to=yanshudiv22@gmail.com", "_blank");
  };

  return (
    <footer className="mt-8 border-t border-border/60">
      <div className="mx-auto max-w-5xl px-5 py-6">
        <div className="space-y-3">
          {/* Row 1: Instagram, LinkedIn, Facebook */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {row1.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-4 text-sm text-muted-foreground transition hover:border-foreground/30 hover:bg-secondary hover:text-foreground"
              >
                <item.Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
                <span className="text-xs">{item.username}</span>
              </a>
            ))}
          </div>

          {/* Row 2: GitHub, X, Email */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {row2.map((item) => (
              item.href.startsWith("mailto") ? (
                <button
                  key={item.href}
                  onClick={handleMailClick}
                  className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-4 text-sm text-muted-foreground transition hover:border-foreground/30 hover:bg-secondary hover:text-foreground w-full"
                >
                  <item.Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  <span className="text-xs">{item.username}</span>
                </button>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-4 text-sm text-muted-foreground transition hover:border-foreground/30 hover:bg-secondary hover:text-foreground"
                >
                  <item.Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  <span className="text-xs">{item.username}</span>
                </a>
              )
            ))}
          </div>
        </div>

        {/* Copyright text */}
        <div className="mt-6 border-t border-border/60 pt-5">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Divyanshu Rauniyar. All rights reserved.</p>
            <p>Made with care in Kathmandu, Nepal.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
