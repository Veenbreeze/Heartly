export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <div className="flex flex-col items-center gap-4">
        <span className="flex size-14 animate-pulse-soft items-center justify-center rounded-2xl bg-gradient-to-br from-rose to-plum text-2xl text-white">
          ♥
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-soft">
          Loading
        </span>
      </div>
    </div>
  );
}
