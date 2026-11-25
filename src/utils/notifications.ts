/**
 * Daily Practice Notification helper for Yayle Juara.
 * Supports Web Notification API + Service Worker notification when available,
 * with graceful in-app banner fallback for restricted browsers or iOS Safari.
 */

export type NotificationResult = 'sent' | 'denied' | 'unsupported';

export async function requestAndSendPracticeNotification(
  title: string,
  body: string
): Promise<NotificationResult> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  let permission = Notification.permission;
  if (permission === 'default') {
    try {
      permission = await Notification.requestPermission();
    } catch {
      return 'denied';
    }
  }

  if (permission !== 'granted') {
    return 'denied';
  }

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: 'yayle-juara-daily-practice',
        });
        return 'sent';
      }
    }
    new Notification(title, {
      body,
      icon: '/pwa-192x192.png',
      tag: 'yayle-juara-daily-practice',
    });
    return 'sent';
  } catch {
    return 'denied';
  }
}

export function isDailyReminderDue(
  enabled: boolean,
  reminderTime: string,
  lastReminderDate: string,
  now = new Date()
): boolean {
  if (!enabled) return false;
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
  if (lastReminderDate === todayKey) return false;

  const [hStr, mStr] = reminderTime.split(':');
  const targetH = Number(hStr ?? 16);
  const targetM = Number(mStr ?? 0);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const targetMinutes = targetH * 60 + targetM;
  return nowMinutes >= targetMinutes;
}
