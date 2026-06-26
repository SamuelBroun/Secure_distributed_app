import type { ReactNode } from "react";
import { Wordmark } from "./Logo";

export function AuthShell({ title, subtitle, children, footer }: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 pb-10 pt-12"
         style={{ background: "var(--bg)" }}>
      <div className="mb-8 flex flex-col items-center text-center">
        <Wordmark size={38} />
        <p className="mt-4 max-w-xs text-sm muted leading-relaxed">
          מערכת ההפעלה האישית של שחקן הכדורגל
        </p>
      </div>

      <div className="card animate-fade-up">
        <h1 className="font-display text-2xl font-extrabold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm muted">{subtitle}</p>}
        <div className="mt-5 space-y-4">{children}</div>
      </div>

      {footer && <div className="mt-5 text-center text-sm muted">{footer}</div>}

      <p className="mt-auto pt-8 text-center text-xs muted leading-relaxed">
        כדורגל הוא חלק מהחיים שלך. הוא לא כל החיים שלך.
      </p>
    </div>
  );
}
