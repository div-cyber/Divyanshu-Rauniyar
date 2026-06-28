import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function ComingSoon({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center fade-up">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
      <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">{title}</h1>
      <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">{description}</p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back home
      </Link>
    </div>
  );
}
