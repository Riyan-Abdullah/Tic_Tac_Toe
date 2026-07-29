import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "cyber-gradient text-white hover:neon-glow-primary hover:scale-105 transition-all duration-200 border-none font-bold cyber-border",
        destructive:
          "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 hover:neon-glow-secondary",
        outline:
          "border border-primary/50 bg-transparent text-primary hover:bg-primary/10 hover:neon-glow-primary",
        secondary:
          "bg-[#0F172A] text-primary border border-primary/50 hover:bg-[#1E293B] hover:neon-glow-primary transition-all duration-200",
        ghost: "hover:bg-slate-800/50 hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline",
        gaming: "cyber-gradient text-white hover:neon-glow-primary hover:scale-105 transition-all duration-200 border-none font-bold uppercase tracking-widest",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8 text-md font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
