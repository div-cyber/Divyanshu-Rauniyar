import { Github, ArrowUpRight } from "lucide-react";
import { portfolio } from "@/data/portfolio";

const Work = () => {
  return (
    <section id="work" className="relative py-20 sm:py-28 gradient-bg section-glow">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono tracking-widest uppercase border border-primary/20 text-primary bg-primary/5 mb-4">
            <Github size={14} />
            Portfolio
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            {portfolio.work.title.split(" ")[0]}{" "}
            <span className="gradient-text">{portfolio.work.title.split(" ").slice(1).join(" ")}</span>
          </h2>
        </div>

        <div className="glass-card glow-border p-8 sm:p-10 md:p-14 max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
          <p className="text-muted-foreground leading-relaxed text-base sm:text-lg md:text-xl">
            {portfolio.work.description}
          </p>
          <a
            href={portfolio.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base sm:text-lg transition-all duration-300 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-1 active:translate-y-0 active:shadow-md"
          >
            <Github size={22} />
            Explore on GitHub
            <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Work;
