import React from "react";
import { cn } from "./utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

export function Progress({ value = 0, className, ...props }: ProgressProps) {
  const porcentaje = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("progress", className)} {...props}>
      <div className="progress-barra" style={{ width: `${porcentaje}%` }} />
    </div>
  );
}
