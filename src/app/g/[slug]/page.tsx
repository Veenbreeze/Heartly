import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Eye } from "lucide-react";
import { GiftExperience } from "@/components/gift/gift-experience";
import { GiftStatus } from "@/components/gift/gift-status";
import { PasswordGate } from "@/components/gift/password-gate";
import { getPublicGiftBySlug } from "@/lib/gift/data";
import { getGiftAccess } from "@/lib/gift/access";
import { safeGiftContent, type TemplateType } from "@/lib/gift/schema";
import { unlockCookieName, verifyUnlockToken } from "@/lib/gift/security";
import { formatDateTime } from "@/lib/utils";

function currentTimestamp() {
  return Date.now();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicGiftBySlug(slug);
  if (!result) return { title: "A Heartly gift", robots: { index: false } };
  const { gift } = result;
  const now = Date.now();
  const expired = Boolean(
    gift.expires_at && new Date(gift.expires_at).getTime() <= now,
  );
  const scheduled = Boolean(
    gift.scheduled_at && new Date(gift.scheduled_at).getTime() > now,
  );
  const live = gift.status === "published" && !expired && !scheduled;

  if (!live) {
    return {
      title: "A Heartly gift",
      description: "This personal gift is not available to preview.",
      robots: { index: false, follow: false, nocache: true },
    };
  }

  if (gift.visibility === "password") {
    return {
      title: "A protected Heartly gift",
      description: "This gift is password protected. Open the link to unlock it.",
      robots: { index: false, follow: false, nocache: true },
    };
  }

  return {
    title: gift.title || `A gift for ${gift.recipient_name} · Heartly`,
    description: gift.message
      ? gift.message.slice(0, 155)
      : `A personal gift made with Heartly for ${gift.recipient_name}.`,
    robots: { index: false, follow: false, nocache: true },
    openGraph: {
      title: gift.title || `A gift for ${gift.recipient_name}`,
      description: gift.message ? gift.message.slice(0, 155) : "A personal gift.",
      type: "website",
    },
  };
}

export default async function PublicGiftPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getPublicGiftBySlug(slug);
  if (!result) return <GiftStatus state="missing" />;

  const { gift, template } = result;
  const access = await getGiftAccess(gift.id);
  const bypass = Boolean(access && access.via !== "admin");
  const now = currentTimestamp();
  const scheduled = Boolean(
    gift.scheduled_at && new Date(gift.scheduled_at).getTime() > now,
  );
  const expired =
    gift.status === "expired" ||
    Boolean(gift.expires_at && new Date(gift.expires_at).getTime() <= now);

  if (!bypass) {
    if (gift.status !== "published") return <GiftStatus state="missing" />;
    if (expired) return <GiftStatus state="expired" />;
    if (scheduled) {
      return (
        <GiftStatus
          state="scheduled"
          detail={
            gift.scheduled_at
              ? `Opens ${formatDateTime(gift.scheduled_at)}`
              : undefined
          }
        />
      );
    }
    if (gift.visibility === "password") {
      const jar = await cookies();
      const token = jar.get(unlockCookieName(slug))?.value;
      if (!verifyUnlockToken(slug, token)) {
        return (
          <PasswordGate slug={slug} recipientName={gift.recipient_name} />
        );
      }
    }
  }

  const content = safeGiftContent(template.default_content, gift.content_data);
  const previewMode =
    bypass && (gift.status !== "published" || scheduled || expired);

  return (
    <div className="relative">
      {previewMode ? (
        <div className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900">
          <p className="flex items-center gap-1.5">
            <Eye className="size-3.5" />
            Sender preview
            {gift.status !== "published"
              ? " · only you can see this"
              : scheduled
                ? " · scheduled"
                : " · expired"}
          </p>
          <Link
            href={`/studio/${gift.id}`}
            className="shrink-0 font-semibold underline underline-offset-2"
          >
            Back to studio
          </Link>
        </div>
      ) : null}
      <GiftExperience
        content={content}
        templateType={template.template_type as TemplateType}
        slug={slug}
        canReport={!bypass}
      />
    </div>
  );
}
