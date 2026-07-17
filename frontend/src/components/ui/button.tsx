import React from "react";
import { cn } from "./utils";

type Variant = "default" | "secondary" | "outline" | "ghost" | "destructive";
type Size = "default" | "sm" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "default", size = "default", asChild, className, children, ...props },
    ref
  ) => {
    const clases = cn("btn", `btn-${variant}`, `btn-size-${size}`, className);

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string }>;
      return React.cloneElement(child, {
        className: cn(clases, child.props.className),
      });
    }

    return (
      <button ref={ref} className={clases} {...props}>
        {children}
      </button>
    );
  }
);
