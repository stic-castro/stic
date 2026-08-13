import * as React from "react"
import { cn } from "../lib/utils"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={cn(
            "flex h-12 w-full appearance-none rounded-md border border-neutral-300 bg-background px-3 py-2 text-base shadow-sm min-h-[48px]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-error focus-visible:ring-error",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <span className="text-xs text-error mt-1">{error}</span>}
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
