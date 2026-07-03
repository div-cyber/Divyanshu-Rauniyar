import {
  Quote,
  Code,
  Brain,
  Rocket,
  BookOpen,
  MapPin,
  GraduationCap,
  Briefcase,
  Mail,
} from "lucide-react";
import profileImage from "../asset/img1.png";

export default function AboutPage() {
  return (
    <div className="fade-up">
      <div className="max-w-7xl mx-auto px-5 pt-5 pb-10 lg:pt-8 lg:pb-12">
        {/* "ABOUT ME" top for all screens */}
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-500">ABOUT ME</p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mt-4">
          {/* Left Column - Main Content (desktop: lg:col-span-8) */}
          <div className="lg:col-span-8 order-2 lg:order-1">
            {/* Profile Image - Mobile only first, after ABOUT ME */}
            <div className="lg:hidden mb-8 relative">
              <div
                className="absolute -top-6 -right-6 w-24 h-24 opacity-20"
                style={{
                  backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
                  backgroundSize: "8px 8px",
                }}
              ></div>
              <div className="absolute -bottom-4 -right-4 text-red-400 opacity-30">
                <svg
                  width="120"
                  height="120"
                  viewBox="0 0 120 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 100 Q60 40 100 100"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <img
                src={profileImage}
                alt="Divyanshu Rauniyar"
                className="w-full rounded-2xl shadow-xl object-cover aspect-[4/5]"
              />
            </div>

            {/* Contact Info - Mobile only, under image and before title */}
            <div className="lg:hidden mb-8 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-foreground" />
                <span>Nepal</span>
              </div>
              <div className="flex items-center gap-3">
                <GraduationCap className="w-4 h-4 text-foreground" />
                <span>Aspiring Tech Enthusiast</span>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-foreground" />
                <span>Founder, Black Byte</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-foreground" />
                <span>yanshudiv22@gmail.com</span>
              </div>
            </div>

            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              Hi, I’m Divyanshu
            </h1>
            <p className="mt-2 text-xl font-semibold italic text-red-500">Nice to meet you! 👋</p>
            <div className="mt-6 w-16 h-0.5 bg-red-500"></div>

            <div className="mt-8 space-y-5 text-[1rem] leading-[1.75] text-muted-foreground">
              <p className="text-foreground font-medium">
                I’m a developer, builder, and someone who genuinely enjoys turning ideas into
                reality.
              </p>
              <p>
                I started coding because I was curious about how technology works, but over time
                that curiosity became an obsession with creating things that solve real problems.
                Whether it’s developing web applications, experimenting with AI, building IoT
                projects, or exploring new technologies, I enjoy the process of learning, building,
                and improving every day.
              </p>
              <p>
                I’m currently working toward becoming an AI Engineer while strengthening my
                full-stack development skills. Alongside that journey, I founded{" "}
                <span className="text-foreground font-semibold">Black Byte</span>, where I build
                software based on real-world needs and work on products that can make a meaningful
                impact.
              </p>
              <p>
                Outside of coding, you’ll probably find me reading books, watching anime, listening
                to music, or discussing ambitious ideas with friends. I believe in continuous
                learning and pushing my limits.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-border/50 bg-card p-5 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-3">
                  <Code className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Full-Stack Developer
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  Building end-to-end web applications.
                </p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-card p-5 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-purple-50 flex items-center justify-center mb-3">
                  <Brain className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  AI & ML Enthusiast
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  Exploring AI to build smarter solutions.
                </p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-card p-5 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                  <Rocket className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Founder @ Black Byte
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  Turning ideas into impactful products.
                </p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-card p-5 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-amber-50 flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Lifelong Learner
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  Always curious, always improving.
                </p>
              </div>
            </div>

            {/* Quote */}
            <div className="mt-8 rounded-2xl bg-muted/40 p-6 flex items-start gap-4">
              <Quote className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
              <p className="text-sm text-muted-foreground">
                My goal is to create technology that gives people more opportunities, helps others
                pursue their dreams, and leaves a positive impact.
              </p>
            </div>
          </div>

          {/* Right Column - Profile & Contact (desktop only) */}
          <div className="lg:col-span-4 space-y-8 order-1 lg:order-2 hidden lg:block">
            {/* Profile Image - Desktop only */}
            <div className="hidden lg:block relative">
              <div
                className="absolute -top-6 -right-6 w-24 h-24 opacity-20"
                style={{
                  backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
                  backgroundSize: "8px 8px",
                }}
              ></div>
              <div className="absolute -bottom-4 -right-4 text-red-400 opacity-30">
                <svg
                  width="120"
                  height="120"
                  viewBox="0 0 120 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 100 Q60 40 100 100"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <img
                src={profileImage}
                alt="Divyanshu Rauniyar"
                className="w-full rounded-2xl shadow-xl object-cover aspect-[4/5]"
              />
            </div>

            {/* Contact Info */}
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-foreground" />
                <span>Nepal</span>
              </div>
              <div className="flex items-center gap-3">
                <GraduationCap className="w-4 h-4 text-foreground" />
                <span>Aspiring Tech Enthusiast</span>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-foreground" />
                <span>Founder, Black Byte</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-foreground" />
                <span>yanshudiv22@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
