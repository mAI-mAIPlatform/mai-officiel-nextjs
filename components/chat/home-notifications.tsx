"use client";

import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  clearNotifications,
  type AppNotification,
  getNotificationHistory,
  markAllNotificationsRead,
  subscribeNotifications,
} from "@/lib/notifications";
import { Button } from "../ui/button";

export function HomeNotifications() {
  const [items, setItems] = useState<AppNotification[]>([]);

  useEffect(() => {
    setItems(getNotificationHistory());
    return subscribeNotifications(() => setItems(getNotificationHistory()));
  }, []);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.read).length,
    [items]
  );

  return (
    <div className="liquid-glass absolute top-3 right-3 z-30 w-[320px] rounded-2xl border border-border/50 bg-card/80 p-3 shadow-[var(--shadow-float)] backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 font-semibold">
          <Bell className="size-4" />
          Notifications
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
            {unreadCount}
          </span>
        </p>
        <div className="flex items-center gap-1">
          <Button
            onClick={() => markAllNotificationsRead(true)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <CheckCheck className="size-4" />
          </Button>
          <Button onClick={clearNotifications} size="icon" type="button" variant="ghost">
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
        {items[0]?.message ?? "Aucune notification."}
      </p>
    </div>
  );
}
