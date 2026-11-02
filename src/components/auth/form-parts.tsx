"use client";

import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions/state";
import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  className,
  pendingLabel,
}: {
  children: React.ReactNode;
  className?: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className={cn("w-full", className)} loading={pending}>
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (!state.message) return null;
  const success = state.status === "success";
  return (
    <div
      role={success ? "status" : "alert"}
      className={cn(
        "flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm leading-relaxed",
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800",
      )}
    >
      {success ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
      )}
      <span>{state.message}</span>
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-red-600">{message}</p>;
}
