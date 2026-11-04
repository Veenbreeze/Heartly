"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, Clock3, Smartphone, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMoney } from "@/lib/utils";

type Network = "mpesa" | "halopesa" | "airtelmoney" | "yas";

const networks: Array<{ value: Network; label: string }> = [
  { value: "mpesa", label: "M-Pesa" },
  { value: "halopesa", label: "Halopesa" },
  { value: "airtelmoney", label: "Airtel Money" },
  { value: "yas", label: "Yas (Mixx by Yas)" },
];

export function PlanCheckoutForm({
  planCode,
  planName,
  amountTzs,
}: {
  planCode: string;
  planName: string;
  amountTzs: number;
}) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [network, setNetwork] = useState<Network | "">("");
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!reference || paymentStatus === "succeeded" || paymentStatus === "failed") return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const response = await fetch(
          `/api/payments/status/${encodeURIComponent(reference)}`,
          { cache: "no-store" },
        );
        const data = (await response.json()) as { status?: string };
        if (!active) return;
        if (data.status) {
          setPaymentStatus(data.status);
          if (data.status === "failed") setLoading(false);
        }
      } catch {
        // Retry while the wallet or provider confirmation is pending.
      }
      if (active) timer = setTimeout(poll, 4000);
    };
    void poll();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [reference, paymentStatus]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!network) {
      toast.error("Choose your mobile money network.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode,
          currency: "TZS",
          phoneNumber,
          network,
        }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        url?: string | null;
        reference?: string;
      };
      if (!response.ok || !data.ok || !data.reference) {
        throw new Error(data.error ?? "Could not start checkout.");
      }
      if (data.url) {
        window.location.assign(data.url);
        return;
      }
      setReference(data.reference);
      setPaymentStatus("pending");
      toast.success("Payment request sent. Check your phone.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not start checkout.",
      );
      setLoading(false);
    }
  }

  if (paymentStatus === "succeeded") {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto size-10 text-emerald-600" />
        <h2 className="mt-4 font-display text-2xl text-emerald-900">
          Payment confirmed
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-emerald-800">
          {planName} is now active on your account.
        </p>
        <Button asChild className="mt-5">
          <Link href="/dashboard/billing">Go to billing</Link>
        </Button>
      </div>
    );
  }

  if (reference && paymentStatus !== "failed") {
    return (
      <div className="rounded-3xl border border-line bg-white/80 p-6 text-center shadow-soft">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-blush text-rose">
          <Clock3 className="size-6" />
        </div>
        <h2 className="mt-4 font-display text-2xl text-plum">
          Enter the PIN in your phone to confirm payment
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          A mobile money prompt for {formatMoney(amountTzs, "TZS")} has been sent
          to {phoneNumber || "your phone"}. Approve it there to activate {planName}.
        </p>
        <p className="mt-4 text-[11px] text-ink-soft">Waiting for confirmation…</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-5"
          onClick={() => {
            setReference(null);
            setPaymentStatus(null);
            setLoading(false);
          }}
        >
          Start over
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      {paymentStatus === "failed" ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          The payment was not completed. Check your balance or network and try again.
        </p>
      ) : null}

      <div className="rounded-2xl border border-line bg-cream/50 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose">
          Selected plan
        </p>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <span className="font-display text-xl text-plum">{planName}</span>
          <span className="font-medium text-plum">
            {formatMoney(amountTzs, "TZS")}
            <span className="ml-1 text-xs font-normal text-ink-soft">/ month</span>
          </span>
        </div>
      </div>

      <div>
        <Label htmlFor="checkout-phone">Mobile money phone number</Label>
        <div className="relative mt-2">
          <Smartphone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
          <Input
            id="checkout-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0712 345 678"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            required
            className="h-12 pl-10"
          />
        </div>
        <p className="mt-1.5 text-[11px] text-ink-soft">
          Use the number registered with your mobile money wallet.
        </p>
      </div>

      <div>
        <Label htmlFor="checkout-network">Network</Label>
        <Select
          value={network}
          onValueChange={(value) => setNetwork(value as Network)}
        >
          <SelectTrigger id="checkout-network" className="mt-2 h-12">
            <SelectValue placeholder="Choose your network" />
          </SelectTrigger>
          <SelectContent>
            {networks.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" size="lg" className="w-full" loading={loading}>
        {!loading ? <Wallet /> : null} Send payment request
      </Button>
      <p className="text-center text-[11px] leading-relaxed text-ink-soft">
        You will receive a prompt on your phone. Enter your wallet PIN there to
        confirm. Heartly never sees or stores your PIN.
      </p>
    </form>
  );
}
