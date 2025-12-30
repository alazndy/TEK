"use client"

import * as React from "react"
import { Bell, Check, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotificationStore } from "@/stores/notification-store"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"

export function NotificationCenter() {
  const [open, setOpen] = React.useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotificationStore()

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative shrink-0 rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground animate-in zoom-in">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Bildirimler</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0" align="end">
        <div className="flex items-center justify-between border-b p-4">
          <h4 className="font-semibold">Bildirimler</h4>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="h-auto px-2 text-xs" onClick={markAllAsRead}>
                    <Check className="mr-1 h-3 w-3" />
                    Tümünü Okundu İşaretle
                </Button>
            )}
            {notifications.length > 0 && (
                 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearAll}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Tümünü Temizle</span>
                </Button>
            )}
           
          </div>
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
              <Bell className="h-10 w-10 opacity-20" />
              <p>Henüz bir bildiriminiz yok.</p>
            </div>
          ) : (
            <div className="grid divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "relative flex gap-4 p-4 transition-colors hover:bg-muted/50",
                    !notification.read && "bg-muted/20"
                  )}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className={cn("mt-1 h-2 w-2 shrink-0 rounded-full bg-primary", notification.read && "bg-transparent")} />
                  <div className="flex-1 space-y-1">
                    <p className={cn("text-sm font-medium leading-none", !notification.read && "font-bold")}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: tr })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
