"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FieldError,
  FormMessage,
  SubmitButton,
} from "@/components/auth/form-parts";
import { initialActionState } from "@/lib/actions/state";
import { updateProfileAction } from "@/lib/actions/auth";

export function SettingsForm({
  fullName,
  bio,
  locale,
  currency,
}: {
  fullName: string;
  bio: string;
  locale: string;
  currency: string;
}) {
  const [state, formAction] = useActionState(updateProfileAction, initialActionState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="fullName">Your name</Label>
          <Input
            id="fullName"
            name="fullName"
            defaultValue={fullName}
            autoComplete="name"
            className="mt-2"
            aria-invalid={Boolean(state.fieldErrors?.fullName)}
            required
          />
          <FieldError message={state.fieldErrors?.fullName} />
        </div>
        <div>
          <Label htmlFor="locale">Language</Label>
          <Select name="locale" defaultValue={locale || "en"}>
            <SelectTrigger id="locale" className="mt-2">
              <SelectValue placeholder="Choose a language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="sw">Kiswahili</SelectItem>
            </SelectContent>
          </Select>
          <FieldError message={state.fieldErrors?.locale} />
        </div>
      </div>

      <div>
        <Label htmlFor="bio">A short note about you</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={bio}
          maxLength={280}
          rows={3}
          placeholder="The person behind the gifts."
          className="mt-2"
        />
        <div className="mt-1 flex justify-between text-[11px] text-ink-soft">
          <span>Optional. Shown only when you choose to share it.</span>
          <span>{bio.length}/280</span>
        </div>
        <FieldError message={state.fieldErrors?.bio} />
      </div>

      <div className="sm:max-w-xs">
        <Label htmlFor="currency">Currency</Label>
        <Select name="currency" defaultValue={currency || "TZS"}>
          <SelectTrigger id="currency" className="mt-2">
            <SelectValue placeholder="Choose a currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TZS">Tanzanian shilling (TZS)</SelectItem>
            <SelectItem value="USD">US dollar (USD)</SelectItem>
          </SelectContent>
        </Select>
        <FieldError message={state.fieldErrors?.currency} />
      </div>

      <SubmitButton className="w-auto px-6">Save changes</SubmitButton>
    </form>
  );
}
