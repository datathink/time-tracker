// src/components/ui/toggle.tsx
"use client"

import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "relative inline-flex items-center rounded-full cursor-pointer transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden",
  {
    variants: {
      variant: {
        ios: "bg-gray-300 data-[state=on]:bg-green-500 w-12 h-7", // iOS style
        default: "bg-gray-300 data-[state=on]:bg-green-500 w-12 h-7",
      },
      size: {
        sm: "w-10 h-6",
        default: "w-12 h-7", // Standard iOS size
        lg: "w-14 h-8",
      },
    },
    defaultVariants: {
      variant: "ios",
      size: "default",
    },
  }
)

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => {
  const isOn = props["aria-pressed"] || props.defaultPressed || props.pressed
  
  return (
    <TogglePrimitive.Root
      ref={ref}
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    >
      {/* iOS-style thumb */}
      <div className={cn(
        "absolute top-1/2 left-1 transform -translate-y-1/2 bg-white rounded-full shadow-md transition-all duration-300 ease-in-out",
        {
          // On state - slide to the right
          "translate-x-5": isOn,
          "translate-x-0": !isOn,
          
          // Size variations
          "h-5 w-5": size === "default",
          "h-4 w-4": size === "sm",
          "h-6 w-6": size === "lg",
        }
      )} />
      <span className="sr-only">Toggle</span>
    </TogglePrimitive.Root>
  )
})

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }