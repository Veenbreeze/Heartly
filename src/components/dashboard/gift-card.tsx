"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Copy,
  Eye,
  ExternalLink,
  Link2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { GiftStatus } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

export interface DashboardGift {
  id: string;
  slug: string;
  title: string;
  recipientName: string;
  templateName: string;
  templateArtUrl: string;
  status: GiftStatus;
  viewCount: number;
  updatedAt: string;
}

const statusBadge: Record<GiftStatus, { label: string; variant: "success" | "outline" | "warning" }> = {
  published: { label: "Live", variant: "success" },
  draft: { label: "Draft", variant: "warning" },
  unpublished: { label: "Unpublished", variant: "outline" },
  expired: { label: "Expired", variant: "outline" },
};

export function DashboardGiftCard({ gift }: { gift: DashboardGift }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const status = statusBadge[gift.status] ?? statusBadge.draft;

  async function duplicate() {
    setBusy(true);
    try {
      const response = await fetch(`/api/gifts/${gift.id}/duplicate`, {
        method: "POST",
      });
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        url?: string;
      };
      if (!response.ok || !data.ok || !data.url) {
        throw new Error(data.error ?? "Could not duplicate this gift.");
      }
      toast.success("A copy is ready.");
      router.push(data.url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not duplicate this gift.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      const response = await fetch(`/api/gifts/${gift.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete this gift.");
      toast.success("Gift deleted.");
      setDeleteOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete this gift.");
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    const url = `${window.location.origin}/g/${gift.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Gift link copied.");
    } catch {
      toast.error("Could not copy the link.");
    }
  }

  return (
    <>
      <article className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-white/70 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
        <Link
          href={`/studio/${gift.id}`}
          className="relative block aspect-[16/10] overflow-hidden bg-blush"
          aria-label={`Edit ${gift.title || gift.recipientName}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gift.templateArtUrl}
            alt=""
            className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute left-3 top-3">
            <Badge variant={status.variant}>{status.label}</Badge>
          </span>
        </Link>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={`/studio/${gift.id}`}
                className="block truncate font-display text-lg leading-tight text-plum hover:text-rose"
              >
                {gift.title || "Untitled gift"}
              </Link>
              <p className="mt-0.5 truncate text-xs text-ink-soft">
                For {gift.recipientName || "someone lovely"} · {gift.templateName}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Gift actions"
                  disabled={busy}
                >
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/studio/${gift.id}`}>
                    <Pencil /> Edit gift
                  </Link>
                </DropdownMenuItem>
                {gift.status === "published" ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href={`/g/${gift.slug}`} target="_blank">
                        <ExternalLink /> Open gift
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => void copyLink()}>
                      <Link2 /> Copy link
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/gifts/${gift.id}`}>
                        <Eye /> Analytics
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : null}
                <DropdownMenuItem onSelect={() => void duplicate()}>
                  <Copy /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setDeleteOpen(true)}
                  className="text-red-600 focus:bg-red-50 focus:text-red-700"
                >
                  <Trash2 /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-[11px] text-ink-soft">
            <span className="flex items-center gap-1">
              <Eye className="size-3.5" /> {gift.viewCount}{" "}
              {gift.viewCount === 1 ? "view" : "views"}
            </span>
            <span>Edited {timeAgo(gift.updatedAt)}</span>
          </div>
        </div>
      </article>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete “{gift.title || "this gift"}”?</DialogTitle>
            <DialogDescription>
              The gift link will stop working and this cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Keep it
            </Button>
            <Button variant="destructive" loading={busy} onClick={() => void remove()}>
              <Trash2 /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
