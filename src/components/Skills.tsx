import { portfolio } from "@/data/portfolio";
import { Code2, Server, Wrench } from "lucide-react";

const categoryMeta: Record<string, { label: string; icon: typeof Code2; description: string }> = {
  frontend: { label: "Frontend", icon: Code2, description: "Building beautiful interfaces" },
  backend: { label: "Backend", icon: Server, description: "Scalable server-side solutions" },
  tools: { label: "Tools & DevOps", icon: Wrench, description: "Development workflow" },
};

const Skills = () => {
  return (
    <section id="skills" className="relative py-20 sm:py-28 gradient-bg section-glow">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono tracking-widest uppercase border border-primary/20 text-primary bg-primary/5 mb-4">
            <Code2 size={14} />
            Tech Stack
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Skills & <span className="gradient-text">Technologies</span>
          </h2>
        </div>

        {/* Responsive: stack on mobile, 3 cols on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {Object.entries(portfolio.skills).map(([category, skills]) => {
            const meta = categoryMeta[category];
            const Icon = meta?.icon ?? Code2;
            return (
              <div
                key={category}
                className="group glass-card-hover glow-border p-5 sm:p-7 space-y-4 sm:space-y-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground font-display">
                      {meta?.label ?? category}
                    </h3>
                    <p className="text-xs text-muted-foreground">{meta?.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="skill-chip cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Skills;
