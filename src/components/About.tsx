import { portfolio } from "@/data/portfolio";
import { User } from "lucide-react";

const About = () => {
  return (
    <section id="about" className="relative py-20 sm:py-28 gradient-bg section-glow">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono tracking-widest uppercase border border-primary/20 text-primary bg-primary/5 mb-4">
            <User size={14} />
            About Me
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Who I <span className="gradient-text">Am</span>
          </h2>
        </div>

        <div className="glass-card glow-border p-8 sm:p-10 md:p-14 max-w-3xl mx-auto transition-all duration-500 hover:shadow-lg hover:shadow-primary/5">
          <p className="text-muted-foreground leading-relaxed text-base sm:text-lg md:text-xl">
            {portfolio.about}
          </p>
          <div className="mt-6 sm:mt-8 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Available for opportunities
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
