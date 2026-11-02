"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, Crown, ExternalLink, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  slug: string;
  canQr: boolean;
}

export function ShareDialog({ open, onOpenChange, url, slug, canQr }: ShareDialogProps) {
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !canQr) return;
    let active = true;
    void import("qrcode").then(async (QRCode) => {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 512,
        margin: 2,
        color: { dark: "#603B59", light: "#FFF9F7" },
      });
      if (active) setQr(dataUrl);
    });
    return () => {
      active = false;
    };
  }, [canQr, open, url]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Your gift is ready.</DialogTitle>
          <DialogDescription>
            Send this link to {slug ? "the person it is for" : "them"}. Anyone
            with the link can open it.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Input value={url} readOnly className="font-mono text-xs" aria-label="Gift link" />
          <Button type="button" size="icon" onClick={copy} aria-label="Copy gift link">
            {copied ? <Check /> : <Copy />}
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button asChild>
            <Link href={`/g/${slug}`} target="_blank">
              <ExternalLink /> Open the gift
            </Link>
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep editing
          </Button>
        </div>

        {canQr ? (
          <div className="flex flex-col items-center rounded-2xl border border-line bg-white/70 p-4">
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} alt="QR code for this gift" className="size-40 rounded-xl" />
            ) : (
              <div className="skeleton size-40 rounded-xl" />
            )}
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-soft">
              <QrCode className="size-3.5 text-rose" /> Scan to open on another device
            </p>
            {qr ? (
              <a
                href={qr}
                download={`heartly-${slug}.png`}
                className="mt-2 text-[11px] font-medium text-rose underline-offset-4 hover:underline"
              >
                Download QR code
              </a>
            ) : null}
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-2xl border border-line bg-blush/40 px-4 py-3 text-xs leading-relaxed text-ink-soft">
            <Crown className="mt-0.5 size-4 shrink-0 text-rose" />
            <span>
              QR codes are a Premium feature.{" "}
              <Link href="/pricing" className="font-medium text-rose underline-offset-2 hover:underline">
                See Premium
              </Link>
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
