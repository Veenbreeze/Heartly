"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function MockCheckout({
  reference,
  planName,
  amount,
}: {
  reference: string;
  planName: string;
  amount: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function confirm() {
    setLoading(true);
    try {
      const response = await fetch("/api/payments/mock/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        url?: string;
      };
      if (!response.ok || !data.ok || !data.url) {
        throw new Error(data.error ?? "Could not complete the simulated payment.");
      }
      toast.success("Simulated payment complete. Premium is active.");
      router.push(data.url);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not complete the payment.",
      );
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[2rem] border border-amber-200 bg-white/80 p-6 shadow-soft sm:p-8">
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        <FlaskConical className="mt-0.5 size-4 shrink-0" />
        <span>
          <strong>Simulation only.</strong> No money will be charged and no real
          payment provider is contacted. This page exists so the checkout flow can
          be tested locally.
        </span>
      </div>

      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-soft">Plan</dt>
          <dd className="font-medium text-plum">{planName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-soft">Amount</dt>
          <dd className="font-medium text-plum">{amount}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-soft">Reference</dt>
          <dd className="max-w-48 truncate font-mono text-[10px] text-ink-soft">
            {reference}
          </dd>
        </div>
      </dl>

      <Button className="mt-6 w-full" loading={loading} onClick={() => void confirm()}>
        <LockKeyhole /> Simulate successful payment
      </Button>
      <p className="mt-3 text-center text-[10px] text-ink-soft">
        This will activate Premium on this account for testing.
      </p>
    </div>
  );
}
