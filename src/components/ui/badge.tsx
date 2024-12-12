import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ring focus:ring-offset-2 font-medium text-sm transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-[#F47B20] text-white",
        success:
          "border-transparent bg-[#00875A] text-white",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  onClose?: () => void
}

function Badge({ className, variant, onClose, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className="hover:bg-black/10 ml-1 p-0.5 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export { Badge, badgeVariants }
