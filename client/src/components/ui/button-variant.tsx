import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { VariantProps, cva } from "class-variance-authority";

const mexicanButtonVariants = cva(
  "inline-block rounded-full font-bold py-3 px-8 transition-all duration-300 hover:scale-105 transform hover:shadow-lg",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90",
        outline: "bg-transparent border-2 text-primary border-primary hover:bg-primary hover:text-primary-foreground",
      },
      size: {
        default: "text-base",
        sm: "text-sm py-2 px-6",
        lg: "text-lg py-4 px-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface MexicanButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof mexicanButtonVariants> {
  asChild?: boolean;
}

const MexicanButton = React.forwardRef<HTMLButtonElement, MexicanButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <Button
        className={cn(mexicanButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
MexicanButton.displayName = "MexicanButton";

export { MexicanButton, mexicanButtonVariants };
