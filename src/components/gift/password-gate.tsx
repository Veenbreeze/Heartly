"use client";

import { useActionState } from "react";
import { Heart, KeyRound, LockKeyhole } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { unlockGift, type UnlockState } from "@/lib/actions/public-gifts";

const initialState: UnlockState = {};

export function PasswordGate({
  slug,
  recipientName,
}: {
  slug: string;
  recipientName: string;
}) {
  const [state, formAction, pending] = useActionState(unlockGift, initialState);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cream px-5 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(232,93,117,0.16),transparent_45%)]"
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-[2rem] border border-line bg-white/80 p-7 shadow-soft backdrop-blur">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blush text-rose">
            <LockKeyhole className="size-6" />
          </span>
          <h1 className="mt-5 text-center font-display text-3xl leading-tight text-plum">
            A private gift
          </h1>
          <p className="mt-2 text-center text-sm leading-relaxed text-ink-soft">
            {recipientName
              ? `Enter the password to open what was made for ${recipientName}.`
              : "Enter the password to open this gift."}
          </p>

          <form action={formAction} className="mt-6 space-y-4">
            <input type="hidden" name="slug" value={slug} />
            <div className="space-y-1.5">
              <Label htmlFor="gift-password">Password</Label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-soft/60" />
                <Input
                  id="gift-password"
                  name="password"
                  type="password"
                  autoComplete="off"
                  autoFocus
                  required
                  maxLength={72}
                  className="h-12 pl-10"
                  placeholder="The secret word"
                  aria-invalid={Boolean(state.error)}
                  aria-describedby={state.error ? "gift-password-error" : undefined}
                />
              </div>
            </div>
            {state.error ? (
              <p id="gift-password-error" role="alert" className="text-xs text-red-600">
                {state.error}
              </p>
            ) : null}
            <Button type="submit" className="h-12 w-full" loading={pending}>
              Open the gift
            </Button>
          </form>
        </div>
        <p className="mt-6 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.24em] text-ink-soft/60">
          Made with <Heart className="size-3 fill-rose text-rose" /> Heartly
        </p>
      </div>
    </main>
  );
}
