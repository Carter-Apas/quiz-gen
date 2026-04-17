import { useEffect, useState } from "react";

type TimerBarProps = {
  startedAt: number | null;
  endsAt: number | null;
  isActive?: boolean;
  label?: string;
};

export function TimerBar({
  startedAt,
  endsAt,
  isActive = true,
  label = "Round timer",
}: TimerBarProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isActive || !endsAt || !startedAt) {
      return;
    }

    let frame = 0;
    const tick = () => {
      const next = Date.now();
      setNow(next >= endsAt ? endsAt : next);

      if (next >= endsAt) {
        return;
      }

      frame = window.requestAnimationFrame(tick);
    };

    setNow(Date.now());
    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [endsAt, isActive, startedAt]);

  if (!isActive || !endsAt || !startedAt) {
    return null;
  }

  const remaining = Math.max(0, endsAt - now);
  const duration = Math.max(1, endsAt - startedAt);
  const progress = Math.max(0, Math.min(1, remaining / duration));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
        <span>{label}</span>
        <span>{Math.ceil(remaining / 1000)}s</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-black/6">
        <div
          className="h-full origin-left rounded-full bg-gradient-to-r from-cool via-accent to-success"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
    </div>
  );
}
