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

        {/* Main Contact Container (Box) */}
        <div className="max-w-5xl mx-auto glass-card glow-border overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-border/30">
            
            {/* Left Side: Social Links (2 Columns) */}
            <div className="p-6 sm:p-10 lg:col-span-2 bg-primary/[0.02]">
              <h3 className="text-lg font-semibold mb-6 text-foreground/80">Social Profiles</h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {socialLinks.map(({ icon: Icon, href, label, hoverColor }) => (
                  <a
                    key={label}
                    href={href}
                    target={label === "Email" ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={`group glass-card-hover glow-border p-4 flex flex-col items-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 ${hoverColor}`}
                  >
                    <Icon size={20} className="text-muted-foreground transition-colors duration-300 group-hover:scale-110 transform" />
                    <span className="text-[10px] sm:text-xs font-medium text-muted-foreground transition-colors duration-300">{label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Right Side: Contact Form */}
            <div className="p-6 sm:p-10 lg:col-span-3">
              <h3 className="text-lg font-semibold mb-6 text-foreground/80">Send a Message</h3>
              <form 
                onSubmit={(e) => e.preventDefault()}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-muted-foreground ml-1">Name</label>
                    <input
                      type="text"
                      id="name"
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl bg-secondary/20 border border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all duration-300 placeholder:text-muted-foreground/30 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-muted-foreground ml-1">Email</label>
                    <input
                      type="email"
                      id="email"
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-xl bg-secondary/20 border border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all duration-300 placeholder:text-muted-foreground/30 text-sm"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-muted-foreground ml-1">Message</label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="How can I help you?"
                    className="w-full px-4 py-3 rounded-xl bg-secondary/20 border border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all duration-300 placeholder:text-muted-foreground/30 resize-none text-sm"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 group transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Send Message
                  <Sparkles size={18} className="transition-transform group-hover:scale-110" />
                </button>
              </form>
            </div>
          </div>
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
