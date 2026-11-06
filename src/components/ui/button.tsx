import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2.5 rounded-xl text-base font-bold whitespace-nowrap transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5 min-h-[48px] touch-manipulation cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 font-black border border-primary/20",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 border border-destructive/40 font-bold",
        outline:
          "border border-border bg-transparent text-foreground shadow-sm hover:bg-secondary hover:text-foreground font-bold",
        secondary:
          "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 shadow-sm font-semibold",
        ghost:
          "text-muted-foreground hover:bg-muted hover:text-foreground font-medium",
        link: "text-primary underline-offset-4 hover:underline font-bold",
        accent:
          "bg-accent text-accent-foreground hover:bg-accent/90 font-black border border-accent/20",
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
