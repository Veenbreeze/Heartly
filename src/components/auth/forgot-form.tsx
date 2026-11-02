"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialActionState } from "@/lib/actions/state";
import { forgotPasswordAction } from "@/lib/actions/auth";
import { FieldError, FormMessage, SubmitButton } from "@/components/auth/form-parts";

export function ForgotForm() {
  const [state, formAction] = useActionState(forgotPasswordAction, initialActionState);
  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormMessage state={state} />
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
      <SubmitButton pendingLabel="Sending…">Send reset link</SubmitButton>
    </form>
  );
}
