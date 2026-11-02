import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-28 w-full rounded-xl border border-line bg-white/80 px-4 py-3 text-sm leading-relaxed text-ink transition placeholder:text-ink-soft/60 focus-visible:border-rose focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/20 disabled:cursor-not-allowed disabled:opacity-60",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
