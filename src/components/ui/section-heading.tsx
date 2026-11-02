import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  action?: React.ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  action,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        action && "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-rose">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-balance text-3xl leading-tight text-plum sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-pretty text-base leading-relaxed text-ink-soft">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
