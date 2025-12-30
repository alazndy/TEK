/**
 * Notification Service for ENV-I
 * Handles Slack webhooks, email notifications, and in-app alerts
 */

import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  doc,
  updateDoc
} from 'firebase/firestore';

// Notification Types
export type NotificationType = 
  | 'low_stock' 
  | 'expiring_lot' 
  | 'transfer_completed'
  | 'order_received'
  | 'quality_alert'
  | 'system';

export type NotificationChannel = 'in_app' | 'email' | 'slack';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  read: boolean;
  userId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface NotificationSettings {
  slackWebhookUrl?: string;
  slackEnabled: boolean;
  emailEnabled: boolean;
  emailRecipients: string[];
  
  // Notification preferences by type
  lowStockAlert: {
    enabled: boolean;
    channels: NotificationChannel[];
    threshold: number; // Days before reaching min stock
  };
  expiringLotAlert: {
    enabled: boolean;
    channels: NotificationChannel[];
    daysBeforeExpiry: number;
  };
  transferAlert: {
    enabled: boolean;
    channels: NotificationChannel[];
  };
  orderAlert: {
    enabled: boolean;
    channels: NotificationChannel[];
  };
}

// Default settings
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  slackEnabled: false,
  emailEnabled: false,
  emailRecipients: [],
  lowStockAlert: {
    enabled: true,
    channels: ['in_app'],
    threshold: 5,
  },
  expiringLotAlert: {
    enabled: true,
    channels: ['in_app'],
    daysBeforeExpiry: 30,
  },
  transferAlert: {
    enabled: true,
    channels: ['in_app'],
  },
  orderAlert: {
    enabled: true,
    channels: ['in_app'],
  },
};

class NotificationService {
  private settingsCache: NotificationSettings | null = null;

  /**
   * Send notification through configured channels
   */
  async sendNotification(
    type: NotificationType,
    title: string,
    message: string,
    options: {
      priority?: NotificationPriority;
      userId?: string;
      metadata?: Record<string, unknown>;
    } = {}
  ): Promise<string> {
    const settings = await this.getSettings();
    const channels = this.getChannelsForType(type, settings);
    
    if (channels.length === 0) {
      console.log('No channels configured for notification type:', type);
      return '';
    }

    // Save to Firestore (in-app notification)
    if (channels.includes('in_app')) {
      const docRef = await addDoc(collection(db, 'notifications'), {
        type,
        title,
        message,
        priority: options.priority || 'medium',
        channels,
        read: false,
        userId: options.userId,
        metadata: options.metadata || {},
        createdAt: Timestamp.fromDate(new Date()),
      });

      // Send to other channels
      if (channels.includes('slack') && settings.slackEnabled && settings.slackWebhookUrl) {
        await this.sendSlackNotification(settings.slackWebhookUrl, title, message, options.priority);
      }

      if (channels.includes('email') && settings.emailEnabled && settings.emailRecipients.length > 0) {
        await this.sendEmailNotification(settings.emailRecipients, title, message);
      }

      return docRef.id;
    }

    return '';
  }

  /**
   * Send Slack webhook notification
   */
  private async sendSlackNotification(
    webhookUrl: string,
    title: string,
    message: string,
    priority?: NotificationPriority
  ): Promise<boolean> {
    try {
      const color = priority === 'critical' ? '#dc2626' :
                    priority === 'high' ? '#f59e0b' :
                    priority === 'medium' ? '#3b82f6' : '#6b7280';

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attachments: [{
            color,
            title,
            text: message,
            footer: 'ENV-I Envanter Sistemi',
            ts: Math.floor(Date.now() / 1000),
          }]
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Slack notification error:', error);
      return false;
    }
  }

  /**
   * Send email notification (placeholder - needs email service integration)
   */
  private async sendEmailNotification(
    recipients: string[],
    title: string,
    message: string
  ): Promise<boolean> {
    // TODO: Integrate with email service (SendGrid, Resend, etc.)
    // For now, just log the intent
    console.log('Email notification would be sent to:', recipients, { title, message });
    
    // In production, you would call Firebase Cloud Function or email API here
    // Example with Cloud Function:
    // await fetch('/api/send-email', {
    //   method: 'POST',
    //   body: JSON.stringify({ recipients, title, message })
    // });
    
    return true;
  }

  /**
   * Get channels for notification type
   */
  private getChannelsForType(type: NotificationType, settings: NotificationSettings): NotificationChannel[] {
    switch (type) {
      case 'low_stock':
        return settings.lowStockAlert.enabled ? settings.lowStockAlert.channels : [];
      case 'expiring_lot':
        return settings.expiringLotAlert.enabled ? settings.expiringLotAlert.channels : [];
      case 'transfer_completed':
        return settings.transferAlert.enabled ? settings.transferAlert.channels : [];
      case 'order_received':
        return settings.orderAlert.enabled ? settings.orderAlert.channels : [];
      default:
        return ['in_app'];
    }
  }

  /**
   * Get notification settings
   */
  async getSettings(): Promise<NotificationSettings> {
    if (this.settingsCache) {
      return this.settingsCache;
    }

    try {
      const snapshot = await getDocs(collection(db, 'notificationSettings'));
      if (snapshot.empty) {
        return DEFAULT_NOTIFICATION_SETTINGS;
      }
      
      const data = snapshot.docs[0].data() as NotificationSettings;
      this.settingsCache = data;
      return data;
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      return DEFAULT_NOTIFICATION_SETTINGS;
    }
  }

  /**
   * Update notification settings
   */
  async updateSettings(settings: Partial<NotificationSettings>): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, 'notificationSettings'));
      
      if (snapshot.empty) {
        await addDoc(collection(db, 'notificationSettings'), {
          ...DEFAULT_NOTIFICATION_SETTINGS,
          ...settings,
        });
      } else {
        const docId = snapshot.docs[0].id;
        await updateDoc(doc(db, 'notificationSettings', docId), settings);
      }
      
      this.settingsCache = null; // Clear cache
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  async getNotifications(userId?: string, limit = 50): Promise<Notification[]> {
    try {
      let q;
      if (userId) {
        q = query(
          collection(db, 'notifications'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(
          collection(db, 'notifications'),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.slice(0, limit).map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Notification[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId?: string): Promise<number> {
    try {
      const baseQuery = userId 
        ? query(collection(db, 'notifications'), where('userId', '==', userId), where('read', '==', false))
        : query(collection(db, 'notifications'), where('read', '==', false));
      
      const snapshot = await getDocs(baseQuery);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // === Convenience methods for common notifications ===

  async sendLowStockAlert(productName: string, currentStock: number, minStock: number): Promise<string> {
    return this.sendNotification(
      'low_stock',
      '⚠️ Düşük Stok Uyarısı',
      `${productName} ürününün stoğu kritik seviyede! Mevcut: ${currentStock}, Minimum: ${minStock}`,
      { priority: 'high', metadata: { productName, currentStock, minStock } }
    );
  }

  async sendExpiringLotAlert(productName: string, lotNumber: string, expiryDate: Date): Promise<string> {
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return this.sendNotification(
      'expiring_lot',
      '📅 Son Kullanma Tarihi Yaklaşıyor',
      `${productName} (Lot: ${lotNumber}) ${daysUntilExpiry} gün içinde sona eriyor.`,
      { priority: daysUntilExpiry <= 7 ? 'high' : 'medium', metadata: { productName, lotNumber, expiryDate, daysUntilExpiry } }
    );
  }

  async sendTransferCompletedAlert(transferNumber: string, fromWarehouse: string, toWarehouse: string): Promise<string> {
    return this.sendNotification(
      'transfer_completed',
      '✅ Transfer Tamamlandı',
      `${transferNumber} numaralı transfer ${fromWarehouse} → ${toWarehouse} tamamlandı.`,
      { priority: 'low', metadata: { transferNumber, fromWarehouse, toWarehouse } }
    );
  }
}

// Export singleton
export const notificationService = new NotificationService();
