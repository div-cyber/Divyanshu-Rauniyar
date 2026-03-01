import { useEffect, useState } from "react";
import { Github, Linkedin, Twitter, Instagram, Facebook, Mail, ExternalLink, Download, ChevronDown } from "lucide-react";
import { portfolio } from "@/data/portfolio";

/* ────────────────────────────────────────────────────────────────
   Social icon mapping (unchanged)
   ──────────────────────────────────────────────────────────────── */
const socialIcons = [
  { icon: Github, href: portfolio.socials.github, label: "GitHub" },
  { icon: Linkedin, href: portfolio.socials.linkedin, label: "LinkedIn" },
  { icon: Twitter, href: portfolio.socials.x, label: "X" },
  { icon: Instagram, href: portfolio.socials.instagram, label: "Instagram" },
  { icon: Facebook, href: portfolio.socials.facebook, label: "Facebook" },
  { icon: Mail, href: `mailto:${portfolio.socials.email}`, label: "Email" },
];

/* ────────────────────────────────────────────────────────────────
   useTypewriter — character-by-character reveal hook
   ──────────────────────────────────────────────────────────────── */
function useTypewriter(text: string, speed = 70, startDelay = 600) {
  const [displayed, setDisplayed] = useState("");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let i = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const start = setTimeout(() => {
      const tick = () => {
        if (i < text.length) {
          i++;
          setDisplayed(text.slice(0, i));
          timeout = setTimeout(tick, speed);
        } else {
          setIsDone(true);
        }
      };
      tick();
    }, startDelay);

    return () => {
      clearTimeout(start);
      clearTimeout(timeout);
    };
  }, [text, speed, startDelay]);

  return { displayed, isDone };
}

/* ────────────────────────────────────────────────────────────────
   Hero Component — with typewriter name animation
   (Particle canvas is now global in App.tsx)
   ──────────────────────────────────────────────────────────────── */
const Hero = () => {
  const fullName = portfolio.name;
  const firstName = fullName.split(" ")[0];
  const lastName = fullName.split(" ").slice(1).join(" ");

  const first = useTypewriter(firstName, 80, 600);
  const last = useTypewriter(lastName, 80, 600 + firstName.length * 80 + 200);

  return (
    <section className="relative min-h-screen flex items-center hero-gradient overflow-hidden">
      {/* Ambient orbs */}
      <div className="ambient-dot w-[32rem] h-[32rem] bg-primary/20 top-10 -left-56 animate-glow-pulse" />
      <div className="ambient-dot w-80 h-80 bg-accent/15 bottom-16 right-0 animate-glow-pulse" style={{ animationDelay: "2s" }} />
      <div className="ambient-dot w-64 h-64 bg-primary/10 top-1/2 right-1/4 animate-glow-pulse" style={{ animationDelay: "4s" }} />

      <div className="container mx-auto px-6 pt-28 pb-20 relative z-10 flex flex-col items-center text-center">

        {/* Role badge */}
        <div className="opacity-0 animate-fade-in-up mb-6">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-mono tracking-widest uppercase border border-primary/30 text-primary bg-primary/5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            {portfolio.role}
          </span>
        </div>

        {/* Typewriter-animated name with post-reveal shimmer */}
        <h1 className="font-display text-4xl xs:text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] font-bold tracking-tight leading-[0.92] mb-6 max-w-5xl">
          <span className={first.isDone ? "shimmer-active" : "text-foreground"}>
            {first.displayed}
          </span>
          {!last.isDone && (
            <span
              className="typewriter-cursor"
              style={{
                height: "0.75em",
                opacity: first.isDone && !last.displayed ? 1 : last.displayed ? 0 : 1,
              }}
            />
          )}
          <br />
          <span className={last.isDone ? "shimmer-gradient-active" : "gradient-text"}>
            {last.displayed}
          </span>
        </h1>

        {/* Tagline */}
        <p className="opacity-0 animate-fade-in-up-delay-2 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed mb-10">
          {portfolio.tagline}
        </p>

        {/* Floating accent pills */}
        <div className="opacity-0 animate-fade-in-up-delay-2 flex flex-wrap justify-center gap-3 mb-10">
          <div className="glass-card px-4 py-2 animate-float shadow-md">
            <p className="text-xs font-mono text-primary">▸ Open to work</p>
          </div>
          <div className="glass-card px-4 py-2 animate-float shadow-md" style={{ animationDelay: "1.5s" }}>
            <p className="text-xs font-mono text-accent">✦ Frontend</p>
          </div>
          <div className="glass-card px-4 py-2 animate-float shadow-md" style={{ animationDelay: "3s" }}>
            <p className="text-xs font-mono text-muted-foreground">⚡ React · Node.js · TypeScript</p>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="opacity-0 animate-fade-in-up-delay-3 flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 mb-10 w-full sm:w-auto px-2 sm:px-0">
          <a
            href={portfolio.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 active:shadow-md w-full sm:w-auto"
          >
            <ExternalLink size={18} />
            View My GitHub
          </a>
          <a
            href={portfolio.resumeUrl}
            download="Divyanshu_Rauniyar_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl border border-border text-foreground font-semibold transition-all duration-300 hover:bg-secondary/60 hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-md w-full sm:w-auto"
          >
            <Download size={18} />
            Download Resume
          </a>
        </div>

        {/* Divider */}
        <div className="opacity-0 animate-fade-in-up-delay-4 w-px h-8 bg-border/50 mb-6" />

        {/* Social links */}
        <div className="opacity-0 animate-fade-in-up-delay-4 flex gap-2 sm:gap-2 justify-center flex-wrap">
          {socialIcons.map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target={label === "Email" ? undefined : "_blank"}
              rel="noopener noreferrer"
              aria-label={label}
              className="p-3 rounded-xl border border-border/50 text-muted-foreground transition-all duration-300 hover:text-primary hover:border-primary/40 hover:bg-primary/5 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 active:translate-y-0"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/50">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <ChevronDown size={16} className="animate-bounce" />
      </div>
    </section>
  );
};

export default Hero;
