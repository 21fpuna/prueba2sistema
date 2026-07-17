import React from "react";
import { cn } from "./utils";

type Variant = "default" | "secondary" | "outline" | "destructive";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return (
    <span className={cn("badge", `badge-${variant}`, className)} {...props} />
  );
}
