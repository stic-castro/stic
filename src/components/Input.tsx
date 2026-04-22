import * as React from "react"
import { cn } from "../lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-md border border-neutral-300 bg-background px-3 py-2 text-base shadow-sm min-h-[48px]",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-error focus-visible:ring-error focus-visible:border-error",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <span className="text-xs text-error mt-1">{error}</span>}
      </div>
    )
  }
)
Input.displayName = "Input"

// Textarea Component for multiline input
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-neutral-300 bg-background px-3 py-2 text-base shadow-sm",
            "placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-error focus-visible:ring-error focus-visible:border-error",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <span className="text-xs text-error mt-1">{error}</span>}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Input, Textarea }
