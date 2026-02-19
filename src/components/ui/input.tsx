import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          // Base layout
          "w-full h-[44px]",
          "rounded-[99px]",
          "px-[20px] pr-[8px] py-[12px]",

          // Border + shadow
          "border border-[#F0F0F0]",
          "shadow-[0px_2px_4px_0px_#0000000A]",

          // Typography
          "text-body text-foreground",
          "placeholder:text-muted-foreground",

          // Focus states
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",

          // Disabled
          "disabled:opacity-50 disabled:cursor-not-allowed",

          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
