import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 [&_svg]:size-3.5",
  {
    variants: {
      variant: {
        default:
          "border-emerald-500/40 bg-emerald-950/70 text-emerald-300 shadow-sm",
        secondary:
          "border-white/20 bg-white/10 text-white shadow-sm",
        destructive:
          "border-red-500/40 bg-red-950/70 text-red-200 shadow-sm",
        outline:
          "border-emerald-500/40 bg-[#0A160F]/80 text-white shadow-sm",
        success:
          "border-emerald-500/40 bg-emerald-950/70 text-[#22C55E] shadow-sm",
        warning:
          "border-amber-500/40 bg-amber-950/70 text-amber-300 shadow-sm",
        accent:
          "border-emerald-500/40 bg-emerald-950/70 text-emerald-300 shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
