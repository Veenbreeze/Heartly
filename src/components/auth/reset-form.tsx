"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialActionState } from "@/lib/actions/state";
import { updatePasswordAction } from "@/lib/actions/auth";
import { FieldError, FormMessage, SubmitButton } from "@/components/auth/form-parts";

export function ResetForm() {
  const [state, formAction] = useActionState(updatePasswordAction, initialActionState);
  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <div>
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          className="mt-2"
          minLength={8}
          aria-invalid={Boolean(state.fieldErrors?.password)}
          required
        />
        <FieldError message={state.fieldErrors?.password} />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat password"
          className="mt-2"
          minLength={8}
          aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
          required
        />
        <FieldError message={state.fieldErrors?.confirmPassword} />
      </div>
      <SubmitButton pendingLabel="Updating…">Update password</SubmitButton>
    </form>
  );
}
