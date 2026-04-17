import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../lib/cn";

export function Shell({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn("min-h-screen bg-transparent text-ink", className)}>
      {children}
    </div>
  );
}

export function GlowPanel({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-black/8 bg-[rgba(255,255,252,0.88)] p-6 shadow-panel backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AccentButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SectionLabel({ children }: PropsWithChildren) {
  return (
    <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-black/45">
      {children}
    </p>
  );
}
