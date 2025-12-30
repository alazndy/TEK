"use client";

import React, { useEffect, useState } from "react";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Clock,
  AlertTriangle,
  Info,
  X,
  Settings,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  getUnreadCount,
  subscribeToNotifications,
  type NotificationPayload,
  type NotificationCategory,
} from "@/lib/ecosystem/notification-hub";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface NotificationCenterProps {
  userId: string;
}

const CATEGORY_ICONS: Record<NotificationCategory, any> = {
  deadline: Clock,
  alert: AlertTriangle,
  reminder: Bell,
  status: Info,
  collaboration: CheckCheck,
  system: Settings,
};

const CATEGORY_COLORS: Record<NotificationCategory, string> = {
  deadline: "text-blue-500",
  alert: "text-red-500",
  reminder: "text-yellow-500",
  status: "text-green-500",
  collaboration: "text-purple-500",
  system: "text-gray-500",
};

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<(NotificationPayload & { read?: boolean })[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  // Load notifications
  const loadNotifications = () => {
    const data = getNotifications(userId);
    setNotifications(data);
    setUnreadCount(getUnreadCount(userId));
  };

  useEffect(() => {
    loadNotifications();
    
    // Subscribe to new notifications
    const unsubscribe = subscribeToNotifications(userId, (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
    
    return unsubscribe;
  }, [userId]);

  const handleMarkAsRead = (id: string) => {
    markAsRead(userId, id);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead(userId);
    loadNotifications();
  };

  const handleClearAll = () => {
    if (confirm("Tüm bildirimleri silmek istediğinize emin misiniz?")) {
      clearNotifications(userId);
      loadNotifications();
    }
  };

  const formatTime = (notification: NotificationPayload) => {
    // Extract timestamp from ID
    const idParts = notification.id?.split("_");
    if (idParts && idParts.length >= 2) {
      const timestamp = parseInt(idParts[1]);
      if (!isNaN(timestamp)) {
        return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: tr });
      }
    }
    return "";
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-96">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Bildirimler
            </SheetTitle>
            <div className="flex gap-1">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Tümünü Oku
                </Button>
              )}
            </div>
          </div>
          <SheetDescription>
            {unreadCount > 0
              ? `${unreadCount} okunmamış bildirim`
              : "Tüm bildirimler okundu"}
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        <ScrollArea className="h-[calc(100vh-200px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <BellOff className="h-12 w-12 opacity-30 mb-2" />
              <p>Bildirim yok</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification, index) => {
                const Icon = CATEGORY_ICONS[notification.category] || Bell;
                const colorClass = CATEGORY_COLORS[notification.category] || "text-gray-500";

                return (
                  <div
                    key={notification.id || index}
                    className={`p-3 rounded-lg border transition-colors ${
                      notification.read
                        ? "bg-background"
                        : "bg-muted/50 border-primary/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${colorClass}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm leading-tight">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() => notification.id && handleMarkAsRead(notification.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {notification.sourceApp}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(notification)}
                          </span>
                        </div>
                        {notification.actionUrl && (
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto mt-2"
                            onClick={() => {
                              if (notification.id) handleMarkAsRead(notification.id);
                              window.location.href = notification.actionUrl!;
                            }}
                          >
                            Görüntüle →
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <Separator className="my-4" />
            <Button
              variant="ghost"
              className="w-full text-destructive"
              onClick={handleClearAll}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Tüm Bildirimleri Temizle
            </Button>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
