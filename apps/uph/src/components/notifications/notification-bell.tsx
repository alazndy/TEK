"use client";

import { useEffect, useState } from "react";
import { useNotificationStore } from "@/stores/notification-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Notification, NotificationType } from "@/types/notification";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'info': return <Info className="h-4 w-4 text-blue-500" />;
    case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
  }
};

export function NotificationBell() {
  const { user } = useAuthStore();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    subscribeToNotifications 
  } = useNotificationStore();
  
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToNotifications(user.uid);
      return () => unsubscribe();
    }
  }, [user, subscribeToNotifications]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead(id);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 animate-pulse ring-2 ring-background" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold leading-none">Bildirimler</h4>
          {unreadCount > 0 && (
             <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => markAllAsRead()}
            >
                Tümünü Oku
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">Bildiriminiz yok</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div 
                    key={notification.id} 
                    className={`p-4 flex gap-3 hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-muted/30' : ''}`}
                >
                  <div className="mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: tr })}
                        </span>
                        {!notification.read && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0" 
                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                title="Okundu olarak işaretle"
                            >
                                <Check className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
