import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2.5 rounded-xl text-base font-bold whitespace-nowrap transition-all outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5 min-h-[48px] touch-manipulation cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[#22C55E] text-[#060D09] hover:bg-[#16A34A] active:bg-[#15803D] font-black shadow-md shadow-emerald-950/50 border border-emerald-300/40",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90 border border-destructive/40 font-bold",
        outline:
          "border-2 border-emerald-500/40 bg-[#0A160F]/80 text-white shadow-sm hover:bg-[#0D2416] hover:border-[#22C55E] hover:text-[#22C55E] font-bold",
        secondary:
          "bg-[#11261A] text-white border border-emerald-500/30 hover:bg-[#163524] hover:border-emerald-500/60 shadow-sm font-semibold",
        ghost:
          "text-white hover:bg-white/10 hover:text-[#22C55E] font-medium",
        link: "text-[#22C55E] underline-offset-4 hover:underline font-bold",
        accent:
          "bg-[#10B981] text-white hover:bg-[#059669] font-black shadow-md shadow-emerald-950/50 border border-emerald-400/40",
      },
      size: {
        default: "min-h-[48px] px-6 py-3 text-base rounded-xl",
        sm: "min-h-[48px] px-4 py-2.5 text-base rounded-xl",
        lg: "min-h-[54px] px-8 py-3.5 text-lg rounded-2xl",
        xl: "min-h-[64px] px-10 py-4 text-xl rounded-2xl",
        icon: "min-h-[48px] min-w-[48px] h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
