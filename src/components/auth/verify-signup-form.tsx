"use client";

import { useActionState } from "react";
import { initialActionState } from "@/lib/actions/state";
import { verifySignupOtpAction } from "@/lib/actions/auth";
import { FieldError, FormMessage, SubmitButton } from "@/components/auth/form-parts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function VerifySignupForm({ email, next }: { email?: string; next?: string }) {
  const [state, formAction] = useActionState(verifySignupOtpAction, initialActionState);

  return (
    <form action={formAction} className="mt-7 space-y-4 text-left" noValidate>
      <input type="hidden" name="next" value={next ?? "/dashboard"} />
      <FormMessage state={state} />
      <div>
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={email}
          placeholder="you@example.com"
          className="mt-2"
          required
        />
      </div>
      <div>
        <Label htmlFor="signup-code">Six digit confirmation code</Label>
        <Input
          id="signup-code"
          name="token"
          inputMode="numeric"
          pattern="[0-9]{6}"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          className="mt-2 h-12 text-center font-mono text-xl tracking-[0.35em]"
          aria-invalid={Boolean(state.fieldErrors?.token)}
          required
        />
        <FieldError message={state.fieldErrors?.token} />
      </div>
      <SubmitButton pendingLabel="Checking code…">Confirm email</SubmitButton>
    </form>
  );
}
