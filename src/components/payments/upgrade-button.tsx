"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock3, Crown, Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UpgradeButton({
  signedIn,
  isPremium,
  amountTzs = 0,
}: {
  signedIn: boolean;
  isPremium: boolean;
  amountTzs?: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [reference, setReference] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!reference || paymentStatus === "succeeded" || paymentStatus === "failed") return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const response = await fetch(`/api/payments/status/${encodeURIComponent(reference)}`, { cache: "no-store" });
        const data = (await response.json()) as { status?: string };
        if (!active) return;
        if (data.status) setPaymentStatus(data.status);
        if (data.status === "succeeded") router.refresh();
      } catch {
        // Retry while waiting for the wallet or provider confirmation.
      }
      if (active) timer = setTimeout(poll, 4000);
    };
    void poll();
    return () => { active = false; clearTimeout(timer); };
  }, [reference, paymentStatus, router]);

  if (!signedIn) {
    return (
      <Button asChild size="lg" className="w-full">
        <Link href="/register?next=/pricing">
          Create an account <ArrowRight />
        </Link>
      </Button>
    );
  }

  if (isPremium) {
    return (
      <Button asChild size="lg" variant="outline" className="w-full">
        <Link href="/dashboard/billing">
          <Crown /> Manage your plan
        </Link>
      </Button>
    );
  }

  async function checkout() {
    setLoading(true);
    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode: "premium", currency: "TZS", phoneNumber }),
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
    return <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm text-emerald-800"><CheckCircle2 className="mx-auto mb-2 size-6" />Payment confirmed. Premium is active.</div>;
  }
  if (reference && paymentStatus !== "failed") {
    return <div className="rounded-2xl border border-line bg-white/80 p-4 text-center"><Clock3 className="mx-auto size-5 text-rose" /><p className="mt-2 text-sm font-medium text-ink">Approve the request on your phone</p><p className="mt-1 text-xs leading-relaxed text-ink-soft">Enter your mobile money PIN in the ClickPesa prompt to complete payment.</p><p className="mt-2 text-[10px] text-ink-soft">Waiting for confirmation…</p></div>;
  }
  return (
    <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void checkout(); }}>
      <label className="block text-left text-xs font-medium text-ink" htmlFor="premium-phone">Mobile money phone number</label>
      <div className="relative"><Smartphone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" /><Input id="premium-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="255 7XX XXX XXX" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} required className="pl-10" /></div>
      <p className="text-left text-[10px] leading-relaxed text-ink-soft">Mobile money charge: TZS {amountTzs.toLocaleString("en-TZ")}. We will send a secure payment prompt to your phone. Enter your wallet PIN there to approve it.</p>
      <Button type="submit" size="lg" className="w-full" loading={loading}>
        {loading ? <Loader2 /> : <Crown />} Send payment request
      </Button>
      {paymentStatus === "failed" ? <p className="text-xs text-red-600">Payment was not approved. Check your number and try again.</p> : null}
    </form>
  );
}
