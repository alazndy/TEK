"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Grid3X3, Layers, Box } from "lucide-react"

export type ViewMode = 'topdown' | 'isometric' | '3d'

interface ViewModeToggleProps {
  value: ViewMode
  onChange: (mode: ViewMode) => void
  className?: string
}

const modes: { value: ViewMode; label: string; icon: React.ReactNode }[] = [
  { value: 'topdown', label: 'Üstten', icon: <Grid3X3 className="h-4 w-4" /> },
  { value: 'isometric', label: 'İzometrik', icon: <Layers className="h-4 w-4" /> },
  { value: '3d', label: '3D', icon: <Box className="h-4 w-4" /> },
]

export function ViewModeToggle({ value, onChange, className }: ViewModeToggleProps) {
  return (
    <div className={cn("inline-flex rounded-lg border bg-muted p-1", className)}>
      {modes.map((mode) => (
        <Button
          key={mode.value}
          variant={value === mode.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(mode.value)}
          className={cn(
            "gap-2 transition-all",
            value === mode.value 
              ? "shadow-sm" 
              : "hover:bg-background/50"
          )}
        >
          {mode.icon}
          <span className="hidden sm:inline">{mode.label}</span>
        </Button>
      ))}
    </div>
  )
}
