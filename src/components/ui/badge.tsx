import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 [&_svg]:size-3.5",
  {
    variants: {
      variant: {
        default:
          "border-border bg-secondary text-muted-foreground shadow-sm",
        secondary:
          "border-border bg-secondary/60 text-secondary-foreground shadow-sm",
        destructive:
          "border-destructive/30 bg-destructive/15 text-destructive shadow-sm",
        outline:
          "border-border bg-transparent text-foreground shadow-sm",
        success:
          "border-primary/30 bg-primary/15 text-primary shadow-sm",
        warning:
          "border-warning/30 bg-warning/15 text-warning shadow-sm",
        accent:
          "border-accent/30 bg-accent/15 text-accent shadow-sm",
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
