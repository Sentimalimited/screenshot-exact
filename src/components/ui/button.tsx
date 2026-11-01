import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold tracking-wide cursor-pointer transition-[background-color,color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "btn-sheen bg-primary text-primary-foreground hover:bg-ink-soft hover:-translate-y-0.5",
        gold: "btn-sheen bg-gold text-gold-foreground hover:bg-gold-soft hover:-translate-y-0.5 hover:shadow-[var(--shadow-gold-glow)]",
        seal: "btn-sheen bg-seal text-seal-foreground shadow-seal hover:bg-seal/90 hover:-translate-y-0.5",
        whatsapp: "btn-sheen bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90 hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-foreground/70 bg-transparent text-foreground hover:bg-foreground hover:text-background hover:-translate-y-0.5",
        "outline-gold": "border border-gold/80 bg-transparent text-gold-soft hover:bg-gold hover:text-gold-foreground hover:-translate-y-0.5",
        secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-seal underline-offset-4 hover:underline px-0",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-7 text-[0.95rem]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
