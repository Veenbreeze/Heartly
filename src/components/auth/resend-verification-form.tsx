"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialActionState } from "@/lib/actions/state";
import { resendVerificationAction } from "@/lib/actions/auth";
import {
  FieldError,
  FormMessage,
  SubmitButton,
} from "@/components/auth/form-parts";

export function ResendVerificationForm({ email }: { email?: string }) {
  const [state, formAction] = useActionState(
    resendVerificationAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="mt-7 space-y-4 text-left" noValidate>
      <FormMessage state={state} />
      <div>
        <Label htmlFor="resend-email">Email</Label>
        <Input
          id="resend-email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={email}
          placeholder="you@example.com"
          className="mt-2"
          required
        />
        <FieldError message={state.fieldErrors?.email} />
      </div>
      <SubmitButton pendingLabel="Sending…">
        Resend six digit code
      </SubmitButton>
    </form>
  );
}
