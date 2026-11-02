"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock3, FlaskConical, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Status {
  status: "pending" | "succeeded" | "failed" | "refunded";
  provider: string;
  planName: string;
  checkoutUrl: string | null;
}

export function PaymentStatus({ reference }: { reference: string }) {
  const [state, setState] = useState<Status | null>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function poll() {
      try {
        const response = await fetch(
          `/api/payments/status/${encodeURIComponent(reference)}`,
          { cache: "no-store" },
        );
        if (!response.ok) return;
        const data = (await response.json()) as { ok: boolean } & Status;
        if (!active || !data.ok) return;
        setState(data);
        setAttempts((value) => value + 1);
        if (data.status === "pending") {
          timer = setTimeout(poll, 4000);
        }
      } catch {
        timer = setTimeout(poll, 6000);
      }
    }

    void poll();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [reference]);

  if (state?.status === "succeeded") {
    return (
      <div className="text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="size-7" />
        </span>
        <h1 className="mt-6 font-display text-4xl text-plum">You are all set.</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          {state.planName} is active on your account. Every template, animation
          and little extra is now yours to use.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/create">Make a gift</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/billing">View billing</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (state?.status === "failed") {
    return (
      <div className="text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-red-50 text-red-600">
          <XCircle className="size-7" />
        </span>
        <h1 className="mt-6 font-display text-4xl text-plum">
          That payment did not go through.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Nothing was activated. You can try again from the billing page, or use a
          different payment method.
        </p>
        <Button asChild className="mt-7">
          <Link href="/pricing">Try again</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        <Clock3 className="size-7" />
      </span>
      <h1 className="mt-6 font-display text-4xl text-plum">
        Confirming your payment.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        This usually takes a few seconds. Keep this page open; it will update on its
        own.
      </p>
      <div className="mx-auto mt-5 flex max-w-xs items-center justify-center gap-2 rounded-full border border-line bg-white/70 px-4 py-2 text-[11px] text-ink-soft">
        <span className="size-1.5 animate-pulse rounded-full bg-rose" />
        {attempts > 2 ? "Still waiting for confirmation" : "Checking with the provider"}
      </div>
      {state?.provider === "mock" && state.checkoutUrl ? (
        <Button asChild variant="outline" className="mt-5">
          <Link href={state.checkoutUrl}>
            <FlaskConical /> Return to simulated checkout
          </Link>
        </Button>
      ) : null}
      <p className="mt-6 text-[10px] text-ink-soft">
        Reference: <span className="font-mono">{reference}</span>
      </p>
    </div>
  );
}
