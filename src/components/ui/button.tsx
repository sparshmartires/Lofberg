import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[99px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-[14px] leading-[20px] font-normal",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-accent hover:bg-primary/90",

        accent:
          "bg-accent text-accent-foreground hover:bg-accent/90",

        outlineBrand:
          "border border-primary text-primary bg-transparent hover:bg-primary/10",

        ghostBrand:
          "text-primary hover:bg-primary/10",
      },

      size: {
        md: "px-[12px] py-[8px]",
        sm: "px-[12px] py-[8px] min-w-[147px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
