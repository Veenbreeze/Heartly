"use client";

import { useState } from "react";
import { Flag, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const reasons = [
  { value: "spam", label: "Spam or a scam" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "explicit", label: "Explicit content" },
  { value: "copyright", label: "Copyright infringement" },
  { value: "impersonation", label: "Impersonation" },
  { value: "other", label: "Something else" },
] as const;

type Reason = (typeof reasons)[number]["value"];

export function ReportGift({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<Reason>("spam");
  const [details, setDetails] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setState("idle");
      setError(null);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setError(null);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giftSlug: slug,
          reason,
          details: details.trim() || undefined,
          website,
        }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Could not send the report.");
      }
      setState("sent");
    } catch (caught) {
      setState("error");
      setError(
        caught instanceof Error ? caught.message : "Could not send the report.",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn("inline-flex items-center gap-1", className)}
        >
          <Flag className="size-3" /> Report this gift
        </button>
      </DialogTrigger>
      <DialogContent>
        {state === "sent" ? (
          <div className="py-4 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <ShieldCheck className="size-5" />
            </span>
            <DialogTitle className="mt-4">Thank you</DialogTitle>
            <DialogDescription className="mt-2">
              Our team will review this report. We keep reports private.
            </DialogDescription>
            <Button
              type="button"
              className="mt-6"
              onClick={() => handleOpenChange(false)}
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Report this gift</DialogTitle>
              <DialogDescription>
                Tell us what is wrong. Reports are reviewed by the Heartly team.
              </DialogDescription>
            </DialogHeader>
            <div>
              <Label htmlFor="report-reason">Reason</Label>
              <Select
                value={reason}
                onValueChange={(value) => setReason(value as Reason)}
              >
                <SelectTrigger id="report-reason" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reasons.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="report-details">Details (optional)</Label>
              <Textarea
                id="report-details"
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                maxLength={2000}
                placeholder="Anything that helps us understand the problem."
                className="mt-2 min-h-24"
              />
            </div>
            <div className="hidden">
              <label htmlFor="report-website">Website</label>
              <input
                id="report-website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />
            </div>
            {error ? (
              <p className="text-xs text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              className="w-full"
              loading={state === "sending"}
            >
              {state === "sending" ? "Sending report…" : "Send report"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
