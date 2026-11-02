import Link from "next/link";
import { CalendarClock, Clock3, Heart, Link2Off } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

const states = {
  missing: {
    icon: Link2Off,
    title: "This gift could not be found.",
    body: "The link may be incomplete, or the sender may have removed the gift.",
  },
  expired: {
    icon: Clock3,
    title: "This gift has closed.",
    body: "It was lovely while it was open. Ask the sender if you need a new link.",
  },
  scheduled: {
    icon: CalendarClock,
    title: "Not quite yet.",
    body: "This gift is waiting for its moment. Come back when it is time.",
  },
} as const;

export function GiftStatus({
  state,
  detail,
}: {
  state: keyof typeof states;
  detail?: string | null;
}) {
  const config = states[state];
  const Icon = config.icon;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-5 py-16 text-center">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <span className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-blush text-rose">
          <Icon className="size-7" />
        </span>
        <h1 className="mt-6 font-display text-4xl leading-tight text-plum">
          {config.title}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
          {config.body}
        </p>
        {detail ? (
          <p className="mt-4 inline-flex rounded-full border border-line bg-white/70 px-4 py-1.5 text-xs text-ink-soft">
            {detail}
          </p>
        ) : null}
        <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/">Discover Heartly</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/create">Make a gift</Link>
          </Button>
        </div>
        <p className="mt-8 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.24em] text-ink-soft/60">
          Made with <Heart className="size-3 fill-rose text-rose" /> Heartly
        </p>
      </div>
    </main>
  );
}
