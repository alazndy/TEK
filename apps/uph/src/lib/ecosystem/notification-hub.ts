// Merkezi Notification Hub - Ekosistem Paylaşımlı Servis
// Bu dosya tüm uygulamalar tarafından kullanılabilir

export type NotificationChannel = 'email' | 'push' | 'slack' | 'inApp' | 'sms';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationCategory = 
  | 'deadline' 
  | 'alert' 
  | 'reminder' 
  | 'status' 
  | 'collaboration' 
  | 'system';

export interface NotificationPayload {
  id?: string;
  userId: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  data?: Record<string, any>;
  actionUrl?: string;
  scheduledFor?: Date;
  expiresAt?: Date;
  sourceApp: 'ENV-I' | 'UPH' | 'Weave';
}

export interface NotificationResult {
  id: string;
  success: boolean;
  channelResults: {
    channel: NotificationChannel;
    success: boolean;
    error?: string;
    messageId?: string;
  }[];
  createdAt: Date;
}

export interface NotificationPreferences {
  userId: string;
  channels: {
    [K in NotificationChannel]: {
      enabled: boolean;
      categories: NotificationCategory[];
    };
  };
  quietHours?: {
    enabled: boolean;
    start: string; // "22:00"
    end: string; // "08:00"
  };
  digest?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly';
    time: string;
  };
}

// Storage keys
const NOTIFICATIONS_KEY = 'ecosystem_notifications';
const PREFERENCES_KEY = 'ecosystem_notification_prefs';

function generateId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// In-memory notification queue for batching
const notificationQueue: NotificationPayload[] = [];
let flushTimer: NodeJS.Timeout | null = null;

// Get stored notifications
export function getNotifications(userId: string): NotificationPayload[] {
  try {
    const stored = localStorage.getItem(`${NOTIFICATIONS_KEY}_${userId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save notification to storage
function saveNotification(userId: string, notification: NotificationPayload): void {
  const notifications = getNotifications(userId);
  notifications.unshift(notification);
  
  // Keep last 100 notifications
  if (notifications.length > 100) {
    notifications.splice(100);
  }
  
  localStorage.setItem(`${NOTIFICATIONS_KEY}_${userId}`, JSON.stringify(notifications));
}

// Get user preferences
export function getNotificationPreferences(userId: string): NotificationPreferences {
  try {
    const stored = localStorage.getItem(`${PREFERENCES_KEY}_${userId}`);
    if (stored) return JSON.parse(stored);
  } catch {}
  
  // Default preferences
  return {
    userId,
    channels: {
      email: { enabled: true, categories: ['deadline', 'alert', 'collaboration'] },
      push: { enabled: true, categories: ['deadline', 'alert', 'reminder'] },
      slack: { enabled: false, categories: ['alert', 'status'] },
      inApp: { enabled: true, categories: ['deadline', 'alert', 'reminder', 'status', 'collaboration', 'system'] },
      sms: { enabled: false, categories: ['alert'] },
    },
    quietHours: { enabled: true, start: '22:00', end: '08:00' },
  };
}

// Update user preferences
export function updateNotificationPreferences(
  userId: string, 
  updates: Partial<NotificationPreferences>
): NotificationPreferences {
  const current = getNotificationPreferences(userId);
  const updated = { ...current, ...updates, userId };
  localStorage.setItem(`${PREFERENCES_KEY}_${userId}`, JSON.stringify(updated));
  return updated;
}

// Check if within quiet hours
function isQuietHours(prefs: NotificationPreferences): boolean {
  if (!prefs.quietHours?.enabled) return false;
  
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes;
  
  const [startH, startM] = prefs.quietHours.start.split(':').map(Number);
  const [endH, endM] = prefs.quietHours.end.split(':').map(Number);
  const startTime = startH * 60 + startM;
  const endTime = endH * 60 + endM;
  
  // Handle overnight quiet hours
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime < endTime;
  }
  
  return currentTime >= startTime && currentTime < endTime;
}

// Check if channel is enabled for category
function isChannelEnabled(
  prefs: NotificationPreferences, 
  channel: NotificationChannel, 
  category: NotificationCategory
): boolean {
  const channelPref = prefs.channels[channel];
  return channelPref.enabled && channelPref.categories.includes(category);
}

// Send via Email (mock - integrate with SendGrid/Resend)
async function sendEmail(payload: NotificationPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  console.log(`[NotificationHub] Email to ${payload.userId}: ${payload.title}`);
  
  // Mock implementation - replace with actual email service
  // Example: SendGrid integration
  // const sgMail = require('@sendgrid/mail');
  // await sgMail.send({ to: userEmail, subject: payload.title, text: payload.message });
  
  return { success: true, messageId: `email_${Date.now()}` };
}

// Send via Push (mock - integrate with FCM)
async function sendPush(payload: NotificationPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  console.log(`[NotificationHub] Push to ${payload.userId}: ${payload.title}`);
  
  // Mock implementation - replace with Firebase Cloud Messaging
  // const admin = require('firebase-admin');
  // await admin.messaging().send({ token: userToken, notification: { title, body } });
  
  // Check if browser supports notifications
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(payload.title, {
        body: payload.message,
        icon: '/icon-192.png',
        data: payload.data,
      });
    }
  }
  
  return { success: true, messageId: `push_${Date.now()}` };
}

// Send via Slack (mock - integrate with Slack Webhook)
async function sendSlack(payload: NotificationPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  console.log(`[NotificationHub] Slack: ${payload.title}`);
  
  // Mock implementation - replace with Slack webhook
  // const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  // await fetch(webhookUrl, {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     text: payload.title,
  //     blocks: [{ type: 'section', text: { type: 'mrkdwn', text: payload.message } }]
  //   })
  // });
  
  return { success: true, messageId: `slack_${Date.now()}` };
}

// Send in-app notification
async function sendInApp(payload: NotificationPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const notificationWithId = { ...payload, id: generateId() };
  saveNotification(payload.userId, notificationWithId);
  
  // Dispatch custom event for real-time UI updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('notification:new', { detail: notificationWithId }));
  }
  
  return { success: true, messageId: notificationWithId.id };
}

// Main send function
export async function sendNotification(payload: NotificationPayload): Promise<NotificationResult> {
  const prefs = getNotificationPreferences(payload.userId);
  const channelResults: NotificationResult['channelResults'] = [];
  
  // Filter channels based on preferences and quiet hours
  const effectiveChannels = payload.channels.filter(channel => {
    // Always allow in-app
    if (channel === 'inApp') return true;
    
    // Skip if quiet hours (except urgent)
    if (isQuietHours(prefs) && payload.priority !== 'urgent') {
      return false;
    }
    
    return isChannelEnabled(prefs, channel, payload.category);
  });
  
  // Send to each channel
  for (const channel of effectiveChannels) {
    try {
      let result: { success: boolean; messageId?: string; error?: string };
      
      switch (channel) {
        case 'email':
          result = await sendEmail(payload);
          break;
        case 'push':
          result = await sendPush(payload);
          break;
        case 'slack':
          result = await sendSlack(payload);
          break;
        case 'inApp':
          result = await sendInApp(payload);
          break;
        case 'sms':
          result = { success: false, error: 'SMS not implemented' };
          break;
        default:
          result = { success: false, error: 'Unknown channel' };
      }
      
      channelResults.push({ channel, ...result });
    } catch (error: any) {
      channelResults.push({ channel, success: false, error: error.message });
    }
  }
  
  return {
    id: generateId(),
    success: channelResults.some(r => r.success),
    channelResults,
    createdAt: new Date(),
  };
}

// Batch send (queue and flush)
export function queueNotification(payload: NotificationPayload): void {
  notificationQueue.push(payload);
  
  // Flush after 1 second of inactivity
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(flushNotificationQueue, 1000);
}

export async function flushNotificationQueue(): Promise<NotificationResult[]> {
  if (notificationQueue.length === 0) return [];
  
  const toSend = [...notificationQueue];
  notificationQueue.length = 0;
  
  const results: NotificationResult[] = [];
  for (const payload of toSend) {
    results.push(await sendNotification(payload));
  }
  
  return results;
}

// Mark notification as read
export function markAsRead(userId: string, notificationId: string): void {
  const notifications = getNotifications(userId);
  const index = notifications.findIndex(n => n.id === notificationId);
  
  if (index >= 0) {
    (notifications[index] as any).read = true;
    (notifications[index] as any).readAt = new Date();
    localStorage.setItem(`${NOTIFICATIONS_KEY}_${userId}`, JSON.stringify(notifications));
  }
}

// Mark all as read
export function markAllAsRead(userId: string): void {
  const notifications = getNotifications(userId);
  notifications.forEach(n => {
    (n as any).read = true;
    (n as any).readAt = new Date();
  });
  localStorage.setItem(`${NOTIFICATIONS_KEY}_${userId}`, JSON.stringify(notifications));
}

// Clear notifications
export function clearNotifications(userId: string, olderThanDays?: number): void {
  if (!olderThanDays) {
    localStorage.removeItem(`${NOTIFICATIONS_KEY}_${userId}`);
    return;
  }
  
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);
  
  const notifications = getNotifications(userId);
  const filtered = notifications.filter(n => {
    const createdAt = n.id ? new Date(parseInt(n.id.split('_')[1])) : new Date();
    return createdAt > cutoff;
  });
  
  localStorage.setItem(`${NOTIFICATIONS_KEY}_${userId}`, JSON.stringify(filtered));
}

// Get unread count
export function getUnreadCount(userId: string): number {
  const notifications = getNotifications(userId);
  return notifications.filter(n => !(n as any).read).length;
}

// Request push permission
export async function requestPushPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Subscribe to notifications (for React components)
export function subscribeToNotifications(
  userId: string, 
  callback: (notification: NotificationPayload) => void
): () => void {
  const handler = (event: CustomEvent<NotificationPayload>) => {
    if (event.detail.userId === userId) {
      callback(event.detail);
    }
  };
  
  window.addEventListener('notification:new', handler as EventListener);
  
  return () => {
    window.removeEventListener('notification:new', handler as EventListener);
  };
}
