import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-[background,color,box-shadow,transform] duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:translate-y-px",
  {
    variants: {
      variant: {
        default:
          "bg-rose text-white shadow-[0_14px_30px_-14px_rgba(232,93,117,0.9)] hover:bg-rose-deep",
        secondary: "bg-blush text-plum hover:bg-petal",
        outline:
          "border border-line bg-white/70 text-ink hover:border-rose/40 hover:bg-blush/60",
        ghost: "text-ink hover:bg-blush/70",
        link: "text-rose underline-offset-4 hover:underline",
        destructive: "bg-destructive text-white hover:opacity-90",
        plum: "bg-plum text-white hover:bg-plum/90",
      },
      size: {
        sm: "h-9 px-4",
        default: "h-11 px-6",
        lg: "h-13 px-8 text-base",
        icon: "size-10 p-0",
        "icon-sm": "size-8 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading, children, disabled, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            <span className="sr-only">Loading</span>
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
