import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GiftStatus, GiftVisibility } from "@/lib/types";

export function AdminPageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl text-plum sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm text-ink-soft">{description}</p>
        ) : null}
      </div>
      {children ? <div className="flex items-center gap-2">{children}</div> : null}
    </div>
  );
}

export function AdminStat({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "default" | "rose" | "success" | "warning";
}) {
  const tones = {
    default: "bg-blush/60 text-plum",
    rose: "bg-rose/10 text-rose",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
  };
  return (
    <div className="rounded-3xl border border-line bg-white/70 p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
          {label}
        </p>
        {Icon ? (
          <span className={cn("flex size-9 items-center justify-center rounded-xl", tones[tone])}>
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-3xl leading-none text-plum">{value}</p>
      {hint ? <p className="mt-2 text-xs text-ink-soft">{hint}</p> : null}
    </div>
  );
}

const giftStatusVariant: Record<
  GiftStatus,
  "success" | "outline" | "warning" | "danger"
> = {
  published: "success",
  draft: "warning",
  unpublished: "outline",
  expired: "danger",
};

const giftStatusLabel: Record<GiftStatus, string> = {
  published: "Live",
  draft: "Draft",
  unpublished: "Unpublished",
  expired: "Expired",
};

export function GiftStatusBadge({ status }: { status: GiftStatus }) {
  return (
    <Badge variant={giftStatusVariant[status] ?? "outline"}>
      {giftStatusLabel[status] ?? status}
    </Badge>
  );
}

const visibilityLabel: Record<GiftVisibility, string> = {
  public: "Public",
  unlisted: "Unlisted",
  password: "Password",
};

export function VisibilityBadge({ visibility }: { visibility: GiftVisibility }) {
  return <Badge variant="outline">{visibilityLabel[visibility] ?? visibility}</Badge>;
}

const reportStatusVariant: Record<
  string,
  "success" | "outline" | "warning" | "danger"
> = {
  open: "danger",
  reviewing: "warning",
  resolved: "success",
  dismissed: "outline",
};

export function ReportStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={reportStatusVariant[status] ?? "outline"}>
      {status[0]?.toUpperCase()}
      {status.slice(1)}
    </Badge>
  );
}
