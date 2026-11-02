"use client";

import { useActionState } from "react";
import { Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { initialActionState } from "@/lib/actions/state";
import { signInWithGoogleAction, signUpAction } from "@/lib/actions/auth";
import { FieldError, FormMessage, SubmitButton } from "@/components/auth/form-parts";

export function RegisterForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(signUpAction, initialActionState);

  return (
    <div className="space-y-5">
      <form action={signInWithGoogleAction}>
        <Button type="submit" variant="outline" className="w-full">
          <Globe /> Continue with Google
        </Button>
      </form>
      <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-ink-soft/60">
        <span className="h-px flex-1 bg-line" />
        or create an account
        <span className="h-px flex-1 bg-line" />
      </div>
      <form action={formAction} className="space-y-4" noValidate>
        <input type="hidden" name="next" value={next ?? "/dashboard"} />
        <FormMessage state={state} />
        <div>
          <Label htmlFor="fullName">Your name</Label>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            placeholder="Amani Joseph"
            className="mt-2"
            aria-invalid={Boolean(state.fieldErrors?.fullName)}
            required
          />
          <FieldError message={state.fieldErrors?.fullName} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="mt-2"
            aria-invalid={Boolean(state.fieldErrors?.email)}
            required
          />
          <FieldError message={state.fieldErrors?.email} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="mt-2"
              aria-invalid={Boolean(state.fieldErrors?.password)}
              minLength={8}
              required
            />
            <FieldError message={state.fieldErrors?.password} />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat password"
              className="mt-2"
              aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
              minLength={8}
              required
            />
            <FieldError message={state.fieldErrors?.confirmPassword} />
          </div>
        </div>
        <label className="flex items-start gap-2.5 text-xs leading-relaxed text-ink-soft">
          <input
            type="checkbox"
            name="terms"
            required
            className="mt-0.5 size-4 rounded border-line accent-rose"
          />
          <span>
            I agree to the{" "}
            <a href="/legal/terms" className="underline hover:text-rose">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/legal/privacy" className="underline hover:text-rose">
              Privacy Policy
            </a>
            .
          </span>
        </label>
        <SubmitButton pendingLabel="Creating account…">
          Create my account
        </SubmitButton>
      </form>
    </div>
  );
}
