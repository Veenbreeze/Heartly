"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Cloud,
  Crown,
  Eye,
  ExternalLink,
  Loader2,
  PanelRight,
  Palette,
  Rocket,
  Settings2,
  Share2,
  Sparkles,
  Trash2,
  Type,
  Undo2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GiftExperience } from "@/components/gift/gift-experience";
import {
  ContentPanel,
  DesignPanel,
  MediaPanel,
  PublishPanel,
} from "@/components/studio/panels";
import { ShareDialog } from "@/components/studio/share-dialog";
import type {
  PublishSettings,
  StudioEditorProps,
} from "@/components/studio/types";
import type { GiftContent } from "@/lib/gift/schema";
import { cn } from "@/lib/utils";

type TabKey = "content" | "design" | "photos" | "publish";

const tabs: { key: TabKey; label: string; icon: typeof Type }[] = [
  { key: "content", label: "Content", icon: Type },
  { key: "design", label: "Design", icon: Palette },
  { key: "photos", label: "Photos", icon: Sparkles },
  { key: "publish", label: "Publish", icon: Settings2 },
];

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIso(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function sanitize(content: GiftContent): GiftContent {
  const questions = (content.questions ?? [])
    .map((question) => ({
      ...question,
      question: question.question.trim(),
      options: question.options.map((option) => option.trim()).filter(Boolean),
    }))
    .filter((question) => question.question.length > 0 && question.options.length >= 2);
  return {
    ...content,
    media: content.media.filter((item) => item.url.trim().length > 0),
    questions: questions.length ? questions : undefined,
  };
}

export function StudioEditor({
  gift,
  template,
  templateType,
  initialContent,
  capabilities,
  isGuest,
  templateArtUrl,
}: StudioEditorProps) {
  const router = useRouter();
  const [content, setContent] = useState<GiftContent>(initialContent);
  const [tab, setTab] = useState<TabKey>("content");
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "unsaved" | "error">(
    "saved",
  );
  const [status, setStatus] = useState(gift.status);
  const [slug, setSlug] = useState(gift.slug);
  const [revision, setRevision] = useState(gift.revision);
  const [publishing, setPublishing] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);

  const [settings, setSettings] = useState<PublishSettings>({
    visibility: gift.visibility,
    password: "",
    scheduledAt: toLocalInput(gift.scheduledAt),
    expiresAt: toLocalInput(gift.expiresAt),
    removeBranding: Boolean(initialContent.branding?.remove),
  });

  const contentRef = useRef(content);
  const revisionRef = useRef(revision);
  const savingRef = useRef(false);
  const saveRef = useRef<() => Promise<boolean>>(async () => false);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const save = useCallback(async (): Promise<boolean> => {
    if (savingRef.current) return false;
    savingRef.current = true;
    setSaveState("saving");
    const snapshot = contentRef.current;
    try {
      const response = await fetch(`/api/gifts/${gift.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: sanitize(snapshot),
          revision: revisionRef.current,
        }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        code?: string;
        revision?: number;
      };
      if (response.status === 409 || data.code === "revision_conflict") {
        setSaveState("error");
        setConflictOpen(true);
        return false;
      }
      if (!response.ok || !data.ok) {
        setSaveState("error");
        return false;
      }
      if (typeof data.revision === "number") {
        revisionRef.current = data.revision;
        setRevision(data.revision);
      }
      if (contentRef.current === snapshot) {
        setDirty(false);
        setSaveState("saved");
      } else {
        setSaveState("unsaved");
        window.setTimeout(() => {
          void saveRef.current();
        }, 600);
      }
      return true;
    } catch {
      setSaveState("error");
      return false;
    } finally {
      savingRef.current = false;
    }
  }, [gift.id]);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  useEffect(() => {
    if (!dirty) return;
    const timer = window.setTimeout(() => {
      void saveRef.current();
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [content, dirty]);

  useEffect(() => {
    function beforeUnload(event: BeforeUnloadEvent) {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void save();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [save]);

  const update = useCallback((patch: Partial<GiftContent>) => {
    setContent((current) => ({ ...current, ...patch }));
    setDirty(true);
    setSaveState("unsaved");
  }, []);

  async function publish() {
    if (dirty) {
      const saved = await save();
      if (!saved) {
        toast.error("Finish saving before publishing.");
        return;
      }
    }
    setPublishing(true);
    try {
      const response = await fetch(`/api/gifts/${gift.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visibility: settings.visibility,
          password: settings.visibility === "password" ? settings.password : undefined,
          scheduledAt: toIso(settings.scheduledAt),
          expiresAt: toIso(settings.expiresAt),
          removeBranding: settings.removeBranding,
          revision: revisionRef.current,
        }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        slug?: string;
        revision?: number;
      };
      if (!response.ok || !data.ok) {
        toast.error(data.error ?? "Could not publish this gift.");
        return;
      }
      if (data.slug) setSlug(data.slug);
      if (typeof data.revision === "number") {
        revisionRef.current = data.revision;
        setRevision(data.revision);
      }
      setStatus("published");
      setShareOpen(true);
      router.refresh();
    } catch {
      toast.error("Could not publish this gift.");
    } finally {
      setPublishing(false);
    }
  }

  async function unpublish() {
    const response = await fetch(`/api/gifts/${gift.id}/publish`, {
      method: "DELETE",
    });
    const data = (await response.json()) as {
      ok: boolean;
      error?: string;
      revision?: number;
    };
    if (!response.ok || !data.ok) {
      toast.error(data.error ?? "Could not unpublish this gift.");
      return;
    }
    if (typeof data.revision === "number") {
      revisionRef.current = data.revision;
      setRevision(data.revision);
    }
    setStatus("unpublished");
    toast.success("Gift unpublished. The link no longer works.");
  }

  async function deleteGift() {
    const response = await fetch(`/api/gifts/${gift.id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Could not delete this gift.");
      return;
    }
    toast.success("Gift deleted.");
    router.push("/dashboard/gifts");
  }

  async function forceSave() {
    const response = await fetch(`/api/gifts/${gift.id}`);
    const data = (await response.json()) as {
      ok: boolean;
      gift?: { revision: number };
    };
    if (data.gift) {
      revisionRef.current = data.gift.revision;
      setRevision(data.gift.revision);
      setConflictOpen(false);
      setDirty(true);
      window.setTimeout(() => {
        void saveRef.current();
      }, 50);
    }
  }

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/g/${slug}`
      : `/g/${slug}`;

  const saveLabel =
    saveState === "saving"
      ? "Saving…"
      : saveState === "unsaved"
        ? "Unsaved changes"
        : saveState === "error"
          ? "Save failed"
          : "Saved";

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-40 border-b border-line bg-cream/90 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Logo size="sm" showWordmark={false} />
            <span className="hidden h-6 w-px bg-line sm:block" />
            <div className="hidden min-w-0 items-center gap-2.5 sm:flex">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={templateArtUrl}
                alt=""
                className="size-8 rounded-lg border border-line object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-plum">{template.name}</p>
                <p className="truncate text-[10px] text-ink-soft">
                  {templateType.replaceAll("_", " ")}
                </p>
              </div>
            </div>
            <Badge
              variant={status === "published" ? "success" : "outline"}
              className="ml-1 hidden sm:inline-flex"
            >
              {status === "published" ? "Live" : status}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <span
              className={cn(
                "hidden items-center gap-1.5 text-xs md:flex",
                saveState === "error" ? "text-red-600" : "text-ink-soft",
              )}
              aria-live="polite"
            >
              {saveState === "saving" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : saveState === "error" ? (
                <AlertCircle className="size-3.5" />
              ) : saveState === "unsaved" ? (
                <Cloud className="size-3.5" />
              ) : (
                <Check className="size-3.5 text-emerald-600" />
              )}
              {saveLabel}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setPreviewOpen(true)}
            >
              <Eye /> Preview
            </Button>
            {status === "published" ? (
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                <Link href={`/g/${slug}`} target="_blank">
                  <ExternalLink /> View
                </Link>
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              onClick={() => void publish()}
              loading={publishing}
            >
              <Rocket />
              {status === "published" ? "Update" : "Publish"}
            </Button>
          </div>
        </div>
      </header>

      {isGuest ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-xs text-amber-800">
          You are creating as a guest.{" "}
          <Link href="/register" className="font-semibold underline underline-offset-2">
            Create a free account
          </Link>{" "}
          to keep this gift in your dashboard and edit it later.
        </div>
      ) : null}

      <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(380px,44%)]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1 overflow-x-auto rounded-full bg-white/70 p-1 shadow-sm [scrollbar-width:none]">
              {tabs.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-medium transition",
                    tab === item.key
                      ? "bg-plum text-white"
                      : "text-ink-soft hover:bg-blush hover:text-plum",
                  )}
                >
                  <item.icon className="size-3.5" />
                  {item.label}
                </button>
              ))}
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href={isGuest ? "/create" : "/dashboard/gifts"}>
                <ArrowLeft /> {isGuest ? "All templates" : "My gifts"}
              </Link>
            </Button>
          </div>

          <div className="mt-4">
            {tab === "content" ? (
              <ContentPanel content={content} update={update} />
            ) : null}
            {tab === "design" ? (
              <DesignPanel content={content} update={update} capabilities={capabilities} />
            ) : null}
            {tab === "photos" ? (
              <MediaPanel
                giftId={gift.id}
                content={content}
                update={update}
                capabilities={capabilities}
              />
            ) : null}
            {tab === "publish" ? (
              <div className="space-y-5">
                <PublishPanel
                  settings={settings}
                  setSettings={setSettings}
                  capabilities={capabilities}
                  status={status}
                  slug={slug}
                />
                <div className="flex flex-wrap gap-2">
                  {status === "published" ? (
                    <>
                      <Button type="button" variant="outline" onClick={() => setShareOpen(true)}>
                        <Share2 /> Share link
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => void unpublish()}>
                        <Undo2 /> Unpublish
                      </Button>
                    </>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 /> Delete gift
                  </Button>
                </div>
                <p className="text-center text-[11px] text-ink-soft">
                  {capabilities.tier === "premium"
                    ? `${capabilities.planName} plan · ${capabilities.maxActiveGifts} active gifts`
                    : "Free plan · 3 active gifts · Upgrade anytime on the pricing page."}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
                <PanelRight className="size-3.5" /> Live preview
              </p>
              <span className="text-[10px] uppercase tracking-wider text-ink-soft/70">
                {content.media.length} photos · {content.animation.type}
              </span>
            </div>
            <div className="h-[calc(100vh-9rem)] overflow-y-auto rounded-[2rem] border border-line bg-white shadow-lift">
              <GiftExperience
                content={content}
                templateType={templateType}
                preview
              />
            </div>
            <p className="mt-2 text-center text-[10px] text-ink-soft">
              Changes appear here instantly. Saving happens as you type.
            </p>
          </div>
        </aside>
      </div>

      {previewOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-cream">
          <div className="flex h-14 items-center justify-between border-b border-line px-4">
            <p className="text-sm font-medium text-plum">Preview</p>
            <Button type="button" variant="ghost" size="sm" onClick={() => setPreviewOpen(false)}>
              <X /> Close
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <GiftExperience content={content} templateType={templateType} preview />
          </div>
        </div>
      ) : null}

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        url={shareUrl}
        slug={slug}
        canQr={capabilities.qrCode}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this gift?</DialogTitle>
            <DialogDescription>
              The link will stop working immediately and this cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Keep it
            </Button>
            <Button variant="destructive" onClick={() => void deleteGift()}>
              <Trash2 /> Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={conflictOpen} onOpenChange={setConflictOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>This gift was changed elsewhere.</DialogTitle>
            <DialogDescription>
              Another tab or device saved a newer version. You can reload the
              latest version, or keep your current text and overwrite it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConflictOpen(false);
                window.location.reload();
              }}
            >
              Reload latest
            </Button>
            <Button onClick={() => void forceSave()}>Keep my version</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {capabilities.tier === "free" ? (
        <div className="fixed bottom-4 left-4 z-20 hidden xl:block">
          <Button asChild variant="plum" size="sm">
            <Link href="/pricing">
              <Crown /> Unlock Premium
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
