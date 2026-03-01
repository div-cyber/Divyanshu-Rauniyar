import { useState, useEffect } from "react";
import { portfolio } from "@/data/portfolio";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass-card border-b border-border/30 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="font-display text-lg font-bold text-foreground tracking-tight">
          {portfolio.name.split(" ")[0]}
          <span className="text-primary">.</span>
        </a>

        {/* ── Desktop nav ── */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="px-4 py-2 text-sm text-muted-foreground rounded-lg transition-all duration-300 hover:text-foreground hover:bg-secondary/50 active:bg-secondary/70"
            >
              {label}
            </a>
          ))}
          <a
            href={portfolio.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 px-4 py-2 text-sm font-medium rounded-lg bg-primary/10 text-primary border border-primary/20 transition-all duration-300 hover:bg-primary/20 hover:shadow-md hover:shadow-primary/10"
          >
            GitHub
          </a>
        </nav>

        {/* ── Mobile hamburger button ── */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors duration-200"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ── Mobile menu drawer ── */}
      <div
        className={`md:hidden fixed inset-0 top-0 z-40 transition-all duration-400 ${
          mobileOpen ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-background/80 backdrop-blur-md transition-opacity duration-400 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMobile}
        />

        {/* Menu panel */}
        <nav
          className={`absolute right-0 top-0 h-full w-72 max-w-[85vw] glass-card border-l border-border/30 p-6 pt-20 flex flex-col gap-2 transition-transform duration-400 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={closeMobile}
              className="px-4 py-3.5 text-base text-muted-foreground rounded-xl transition-all duration-300 hover:text-foreground hover:bg-secondary/50 active:bg-secondary/70"
            >
              {label}
            </a>
          ))}
          <hr className="border-border/30 my-2" />
          <a
            href={portfolio.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMobile}
            className="px-4 py-3.5 text-base font-medium rounded-xl bg-primary/10 text-primary border border-primary/20 text-center transition-all duration-300 hover:bg-primary/20"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
