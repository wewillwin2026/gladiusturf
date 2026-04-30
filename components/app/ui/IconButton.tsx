import * as React from "react";
import { cn } from "@/lib/cn";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md";
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ size = "md", className, ...rest }, ref) {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-g-text-muted hover:text-g-text hover:bg-g-surface-2 transition-colors disabled:opacity-50",
          size === "sm" ? "h-7 w-7" : "h-8 w-8",
          className,
        )}
        {...rest}
      />
    );
  },
);
