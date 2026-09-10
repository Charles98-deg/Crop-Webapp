import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-2xl border p-4 sm:p-5 text-sm sm:text-base [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 sm:[&>svg]:top-5 [&>svg]:size-5 [&>svg+div]:translate-y-0 [&:has(svg)]:pl-12",
  {
    variants: {
      variant: {
        default:
          "border-emerald-500/30 bg-[#0D1C13]/85 text-white backdrop-blur-md shadow-lg",
        destructive:
          "border-red-500/40 bg-red-950/50 text-red-100 backdrop-blur-md shadow-lg [&>svg]:text-red-400",
        warning:
          "border-amber-500/40 bg-amber-950/50 text-amber-100 backdrop-blur-md shadow-lg [&>svg]:text-amber-400",
        success:
          "border-emerald-500/40 bg-emerald-950/50 text-emerald-100 backdrop-blur-md shadow-lg [&>svg]:text-[#22C55E]",
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
      className={cn("font-bold leading-snug tracking-tight text-base sm:text-lg text-white", className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("mt-1.5 text-sm sm:text-base leading-relaxed text-slate-200 [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, alertVariants };
