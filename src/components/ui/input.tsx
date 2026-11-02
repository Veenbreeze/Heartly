import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-line bg-white/80 px-4 py-2 text-sm text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition placeholder:text-ink-soft/60 focus-visible:border-rose focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/20 disabled:cursor-not-allowed disabled:opacity-60 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
