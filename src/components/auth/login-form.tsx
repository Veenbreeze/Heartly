"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { initialActionState } from "@/lib/actions/state";
import { signInAction, signInWithGoogleAction } from "@/lib/actions/auth";
import { FieldError, FormMessage, SubmitButton } from "@/components/auth/form-parts";

export function LoginForm({ next, setup }: { next?: string; setup?: boolean }) {
  const [state, formAction] = useActionState(signInAction, initialActionState);
  const emailError = state.fieldErrors?.email;
  const passwordError = state.fieldErrors?.password;

  return (
    <div className="space-y-5">
      {setup ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
          Accounts are not connected yet. Add your Supabase keys to
          <code className="mx-1 rounded bg-white/70 px-1.5 py-0.5 text-[11px]">.env.local</code>
          to enable sign in.
        </div>
      ) : null}
      <form action={signInWithGoogleAction}>
        <input type="hidden" name="next" value={next ?? "/dashboard"} />
        <Button type="submit" variant="outline" className="h-12 w-full rounded-2xl border-[#e9ded8] bg-white text-plum shadow-sm hover:bg-[#fbf6f1]">
          <Globe /> Continue with Google
        </Button>
      </form>
      <div className="flex items-center gap-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft/55">
        <span className="h-px flex-1 bg-line" />
        or with email
        <span className="h-px flex-1 bg-line" />
      </div>
      <form action={formAction} className="space-y-4" noValidate>
        <input type="hidden" name="next" value={next ?? "/dashboard"} />
        <FormMessage state={state} />
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="mt-2 h-12 rounded-xl border-[#e7dcd5] bg-[#fdfbf9] px-4 placeholder:text-ink-soft/45 focus-visible:bg-white"
            aria-invalid={Boolean(emailError)}
            required
          />
          <FieldError message={emailError} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-rose hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            className="mt-2 h-12 rounded-xl border-[#e7dcd5] bg-[#fdfbf9] px-4 placeholder:text-ink-soft/45 focus-visible:bg-white"
            aria-invalid={Boolean(passwordError)}
            required
          />
          <FieldError message={passwordError} />
        </div>
        <SubmitButton className="h-12 rounded-xl" pendingLabel="Signing in…">Log in</SubmitButton>
      </form>
    </div>
  );
}
