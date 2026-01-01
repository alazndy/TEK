"use client"

import * as React from "react"
import { LayoutGrid, Package, Share2, Boxes } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSettingsStore } from "@/stores/settings-store"

const apps = [
    {
        name: "T-HUB",
        description: "Unified Project Hub",
        url: "http://localhost:3000",
        icon: LayoutGrid,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20"
    },
    {
        name: "ENV-I",
        description: "Inventory Management",
        url: "http://localhost:3001",
        icon: Package,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20"
    },
    {
        name: "T-WEAVE",
        description: "Technical Design Tool",
        url: "http://localhost:3004",
        icon: Share2,
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20"
    }
]

export function EcosystemSwitcher() {
  const { system } = useSettingsStore();

  const filteredApps = apps.filter(app => {
    if (app.name === "T-WEAVE") return system.integrations?.weave ?? true;
    if (app.name === "ENV-I") return system.integrations?.envInventory ?? true;
    return true;
  });

  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full hover:bg-muted text-muted-foreground hover:text-primary">
                <Boxes className="h-5 w-5" />
                <span className="sr-only">Switch App</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">App Switcher</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent className="w-80 p-2" align="end">
        <DropdownMenuLabel className="font-normal text-xs text-muted-foreground uppercase tracking-wider px-2 py-1.5">
          Ecosystem Apps
        </DropdownMenuLabel>
        <div className="grid grid-cols-1 gap-1">
            {filteredApps.map((app) => (
                <DropdownMenuItem key={app.name} asChild className="p-0 focus:bg-transparent">
                    <a 
                        href={app.url}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
                    >
                        <div className={`p-2.5 rounded-lg border ${app.bg} ${app.border} ${app.color} group-hover:scale-105 transition-transform`}>
                            <app.icon className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                {app.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {app.description}
                            </span>
                        </div>
                    </a>
                </DropdownMenuItem>
            ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
