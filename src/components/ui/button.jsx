import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-white/25 bg-primary/90 text-primary-foreground shadow-[0_18px_44px_-30px_rgba(15,23,42,0.65)] hover:-translate-y-0.5 hover:bg-primary dark:border-white/[0.15] dark:bg-white/90 dark:text-slate-950 dark:hover:bg-white",
        destructive:
          "border border-red-300/30 bg-destructive/90 text-destructive-foreground shadow-[0_18px_44px_-30px_rgba(220,38,38,0.65)] hover:-translate-y-0.5 hover:bg-destructive",
        outline:
          "glass-control border text-foreground hover:-translate-y-0.5 hover:bg-white/70 hover:text-foreground dark:text-slate-100 dark:hover:bg-white/[0.12]",
        secondary:
          "glass-control border text-secondary-foreground hover:-translate-y-0.5 hover:bg-white/70 dark:text-slate-100 dark:hover:bg-white/[0.12]",
        ghost: "hover:bg-white/55 hover:text-foreground dark:hover:bg-white/10 dark:hover:text-white",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-xl px-3 text-xs",
        lg: "h-10 rounded-2xl px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
