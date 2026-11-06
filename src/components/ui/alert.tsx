import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-2xl border p-4 sm:p-5 text-sm sm:text-base [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 sm:[&>svg]:top-5 [&>svg]:size-5 [&>svg+div]:translate-y-0 [&:has(svg)]:pl-12",
  {
    variants: {
      variant: {
        default:
          "border-border bg-card text-card-foreground shadow-sm",
        destructive:
          "border-destructive/30 bg-destructive/15 text-foreground shadow-sm [&>svg]:text-destructive",
        warning:
          "border-warning/30 bg-warning/15 text-foreground shadow-sm [&>svg]:text-warning",
        success:
          "border-primary/30 bg-primary/15 text-foreground shadow-sm [&>svg]:text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"h5">) {
  return (
    <h5
      data-slot="alert-title"
      className={cn("font-bold leading-snug tracking-tight text-base sm:text-lg text-foreground", className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("mt-1.5 text-sm sm:text-base leading-relaxed text-muted-foreground [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, alertVariants };
