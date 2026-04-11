"use client";

export type NotificationLevel = "success" | "warning" | "error" | "info";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  level: NotificationLevel;
  createdAt: string;
  read: boolean;
  source: "user" | "system";
};

const STORAGE_KEY = "mai.notifications.history.v1";
const EVENT_NAME = "mai:notifications-updated";

function emitUpdate() {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function getNotificationHistory(): AppNotification[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as AppNotification[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item) => item && typeof item === "object")
      .slice(0, 150);
  } catch {
    return [];
  }
}

function saveNotificationHistory(items: AppNotification[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 150)));
  emitUpdate();
}

export function createNotification(input: {
  level: NotificationLevel;
  message: string;
  source?: "user" | "system";
  title?: string;
}) {
  const titleByLevel: Record<NotificationLevel, string> = {
    error: "Erreur",
    info: "Information",
    success: "Succès",
    warning: "Avertissement",
  };

  const next: AppNotification = {
    createdAt: new Date().toISOString(),
    id: crypto.randomUUID(),
    level: input.level,
    message: input.message.trim(),
    read: false,
    source: input.source ?? "system",
    title: input.title?.trim() || titleByLevel[input.level],
  };

  const current = getNotificationHistory();
  saveNotificationHistory([next, ...current]);
}

export function markNotificationRead(id: string, read: boolean) {
  const items = getNotificationHistory();
  saveNotificationHistory(
    items.map((item) => (item.id === id ? { ...item, read } : item))
  );
}

export function markAllNotificationsRead(read: boolean) {
  const items = getNotificationHistory();
  saveNotificationHistory(items.map((item) => ({ ...item, read })));
}

export function clearNotifications() {
  saveNotificationHistory([]);
}

export function subscribeNotifications(onUpdate: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(EVENT_NAME, onUpdate);
  return () => window.removeEventListener(EVENT_NAME, onUpdate);
}
