"use client";

import { useActionState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialActionState } from "@/lib/actions/state";
import { createGiftAction } from "@/lib/actions/gifts";
import { FormMessage, SubmitButton } from "@/components/auth/form-parts";

export function CreateGiftForm({
  templateSlug,
  disabled,
}: {
  templateSlug: string;
  disabled?: boolean;
}) {
  const [state, formAction] = useActionState(createGiftAction, initialActionState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="templateSlug" value={templateSlug} />
      <FormMessage state={state} />
      <div>
        <Label htmlFor="recipientName">
          Who is it for? <span className="font-normal text-ink-soft">(optional)</span>
        </Label>
        <Input
          id="recipientName"
          name="recipientName"
          placeholder="Their name or nickname"
          className="mt-2"
          maxLength={120}
          disabled={disabled}
        />
        <p className="mt-1.5 text-xs text-ink-soft">
          You can change this anytime. It only helps us personalise the starting
          point.
        </p>
      </div>
      <SubmitButton pendingLabel="Opening the studio…" className="w-full">
        {disabled ? "Connect Supabase to start" : "Start creating"} <Sparkles />
      </SubmitButton>
      {disabled ? null : (
        <p className="text-center text-xs text-ink-soft">
          Free to start. Your draft saves as you go. <ArrowRight className="inline size-3" />
        </p>
      )}
    </form>
  );
}
