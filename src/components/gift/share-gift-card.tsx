"use client";

import { useState } from "react";
import { Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareGiftCardProps {
  title: string;
  message: string;
  senderName?: string;
  background: string;
  accent: string;
  text: string;
}

function drawCard({ title, message, senderName, background, accent, text }: ShareGiftCardProps) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1500;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image export is unavailable in this browser.");

  const gradient = context.createLinearGradient(0, 0, 1200, 1500);
  gradient.addColorStop(0, background);
  gradient.addColorStop(1, `${accent}38`);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1200, 1500);
  context.fillStyle = `${accent}22`;
  context.beginPath();
  context.arc(1040, 170, 280, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.arc(90, 1380, 220, 0, Math.PI * 2);
  context.fill();

  const pad = 112;
  context.fillStyle = accent;
  context.font = "600 28px Arial, sans-serif";
  context.letterSpacing = "8px";
  context.fillText("A DIGITAL KEEPSAKE", pad, 190);
  context.letterSpacing = "0px";

  context.fillStyle = text;
  context.font = "600 78px Georgia, serif";
  let y = drawWrapped(context, title, pad, 330, 940, 94, 3);
  y += 62;
  context.font = "400 42px Arial, sans-serif";
  y = drawWrapped(context, message, pad, y, 940, 66, 11);
  if (senderName) {
    y += 80;
    context.fillStyle = accent;
    context.font = "italic 38px Georgia, serif";
    context.fillText(`With love, ${senderName}`, pad, Math.min(y, 1320));
  }
  context.strokeStyle = `${accent}88`;
  context.lineWidth = 3;
  context.beginPath();
  context.roundRect(54, 54, 1092, 1392, 48);
  context.stroke();
  return canvas;
}

function drawWrapped(
  context: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  let lines = 0;
  for (const paragraph of value.split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) {
      y += lineHeight;
      continue;
    }
    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (line && context.measureText(next).width > maxWidth) {
        context.fillText(line, x, y);
        y += lineHeight;
        lines += 1;
        line = word;
      } else {
        line = next;
      }
      if (lines >= maxLines) break;
    }
    if (lines < maxLines && line) {
      context.fillText(line, x, y);
      y += lineHeight;
      lines += 1;
    }
    if (lines >= maxLines) break;
    y += lineHeight * 0.35;
  }
  return y;
}

export function ShareGiftCard(props: ShareGiftCardProps) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function shareCard(downloadOnly = false) {
    setBusy(true);
    setStatus("");
    try {
      const canvas = drawCard(props);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((file) => file ? resolve(file) : reject(new Error("Could not create the card image.")), "image/png");
      });
      const file = new File([blob], "heartly-card.png", { type: "image/png" });
      if (!downloadOnly && navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: props.title });
        setStatus("Your card image is ready to share.");
      } else {
        const anchor = document.createElement("a");
        anchor.href = URL.createObjectURL(blob);
        anchor.download = "heartly-card.png";
        anchor.click();
        URL.revokeObjectURL(anchor.href);
        setStatus(downloadOnly ? "Card image downloaded." : "Card image downloaded. Attach it in any social app.");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setStatus(error instanceof Error ? error.message : "Could not share this card.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto mt-8 w-full max-w-xl rounded-3xl border border-black/5 bg-white/60 p-5 text-center backdrop-blur sm:p-6" aria-label="Share this card">
      <p className="text-sm font-medium">Keep or share the card</p>
      <p className="mt-1 text-xs opacity-65">Share the card image itself to WhatsApp, Instagram, or another app. It will not include this private gift link.</p>
      <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
        <Button type="button" onClick={() => void shareCard()} loading={busy}>
          <Share2 /> Share card image
        </Button>
        <Button type="button" variant="outline" onClick={() => void shareCard(true)} disabled={busy}>
          <Download /> Download image
        </Button>
      </div>
      {status ? <p className="mt-3 text-xs opacity-70" role="status">{status}</p> : null}
    </section>
  );
}
