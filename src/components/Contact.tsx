import { Github, Linkedin, Twitter, Instagram, Facebook, Mail, Sparkles } from "lucide-react";
import { portfolio } from "@/data/portfolio";

const socialLinks = [
  { icon: Github, href: portfolio.socials.github, label: "GitHub", hoverColor: "hover:text-foreground hover:border-foreground/40 hover:shadow-foreground/10" },
  { icon: Linkedin, href: portfolio.socials.linkedin, label: "LinkedIn", hoverColor: "hover:text-blue-400 hover:border-blue-400/40 hover:shadow-blue-400/10" },
  { icon: Twitter, href: portfolio.socials.x, label: "X", hoverColor: "hover:text-foreground hover:border-foreground/40 hover:shadow-foreground/10" },
  { icon: Instagram, href: portfolio.socials.instagram, label: "Instagram", hoverColor: "hover:text-pink-400 hover:border-pink-400/40 hover:shadow-pink-400/10" },
  { icon: Facebook, href: portfolio.socials.facebook, label: "Facebook", hoverColor: "hover:text-blue-500 hover:border-blue-500/40 hover:shadow-blue-500/10" },
  { icon: Mail, href: `mailto:${portfolio.socials.email}`, label: "Email", hoverColor: "hover:text-primary hover:border-primary/40 hover:shadow-primary/10" },
];

const Contact = () => {
  return (
    <section id="contact" className="relative py-20 sm:py-28 gradient-bg section-glow">
      {/* Ambient glow */}
      <div className="ambient-dot w-80 h-80 bg-primary/15 bottom-0 left-1/4 animate-glow-pulse" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono tracking-widest uppercase border border-primary/20 text-primary bg-primary/5 mb-4">
            <Sparkles size={14} />
            Contact
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Let's <span className="gradient-text">Connect</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto">
            {portfolio.contact.cta}
          </p>
        </div>

        {/* Social cards — responsive grid */}
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 max-w-2xl mx-auto mb-12 sm:mb-16">
          {socialLinks.map(({ icon: Icon, href, label, hoverColor }) => (
            <a
              key={label}
              href={href}
              target={label === "Email" ? undefined : "_blank"}
              rel="noopener noreferrer"
              aria-label={label}
              className={`group glass-card-hover glow-border p-4 sm:p-5 flex flex-col items-center gap-2 sm:gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-md ${hoverColor}`}
            >
              <Icon size={22} className="text-muted-foreground transition-colors duration-300 group-hover:scale-110 transform" />
              <span className="text-[11px] sm:text-xs font-medium text-muted-foreground transition-colors duration-300">{label}</span>
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-border/30">
          <p className="text-muted-foreground/60 text-sm">
            © {new Date().getFullYear()} {portfolio.name} · Built with passion
          </p>
        </div>
      </div>
    </section>
  );
};

export default Contact;
