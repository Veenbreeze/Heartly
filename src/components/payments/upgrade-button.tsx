"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Crown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function UpgradeButton({
  signedIn,
  isPremium,
  currency = "TZS",
}: {
  signedIn: boolean;
  isPremium: boolean;
  currency?: "TZS" | "USD";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
        body: JSON.stringify({ planCode: "premium", currency }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        url?: string;
      };
      if (!response.ok || !data.ok || !data.url) {
        throw new Error(data.error ?? "Could not start checkout.");
      }
      if (data.url.startsWith("/")) {
        router.push(data.url);
        router.refresh();
        return;
      }
      window.location.assign(data.url);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not start checkout.",
      );
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      size="lg"
      className="w-full"
      loading={loading}
      onClick={() => void checkout()}
    >
      {loading ? <Loader2 /> : <Crown />} Upgrade to Premium
    </Button>
  );
}
