import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * PushNotificationService – Send browser push notifications via Web Push API or FCM.
 *
 * This service provides an abstraction for sending push notifications to web browsers.
 * Two modes are supported:
 *  1. Web Push (self-hosted, using VAPID keys): requires web-push npm package
 *  2. Firebase Cloud Messaging (FCM): requires firebase-admin npm package
 *
 * Environment Variables:
 *  - PUSH_PROVIDER=webpush|fcm (default: webpush)
 *  - VAPID_PUBLIC_KEY (for webpush mode)
 *  - VAPID_PRIVATE_KEY (for webpush mode)
 *  - VAPID_SUBJECT (for webpush mode, e.g., mailto:admin@yourdomain.com)
 *  - FIREBASE_SERVICE_ACCOUNT_JSON (for fcm mode, base64 or raw JSON)
 *
 * Usage:
 *  1. Store user push subscriptions (endpoint, keys) in your database.
 *  2. Call pushNotificationService.sendNotification(subscription, payload).
 *  3. The service will use the configured provider to deliver the notification.
 *
 * Installation (optional, depending on which provider you use):
 *   npm install web-push firebase-admin
 */
@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private readonly provider: 'webpush' | 'fcm';

  constructor(private readonly configService: ConfigService) {
    this.provider = (this.configService.get<string>('PUSH_PROVIDER') || 'webpush') as any;

    if (this.provider === 'webpush') {
      this.logger.log('PushNotificationService: Web Push mode. Ensure VAPID keys are configured.');
    } else if (this.provider === 'fcm') {
      this.logger.log('PushNotificationService: FCM mode. Ensure FIREBASE_SERVICE_ACCOUNT_JSON is configured.');
    }
  }

  /**
   * Send a push notification to a single subscription.
   *
   * @param subscription Push subscription object (endpoint, keys)
   * @param payload Notification payload with title, body, icon, etc.
   * @returns True if successful, false otherwise
   */
  async sendNotification(
    subscription: {
      endpoint: string;
      keys: {
        p256dh: string;
        auth: string;
      };
    },
    payload: {
      title: string;
      body: string;
      icon?: string;
      badge?: string;
      data?: Record<string, any>;
    },
  ): Promise<boolean> {
    if (this.provider === 'webpush') {
      return this.sendWebPush(subscription, payload);
    } else if (this.provider === 'fcm') {
      return this.sendFcm(subscription, payload);
    }
    return false;
  }

  /**
   * Send push notification using Web Push API (VAPID).
   */
  private async sendWebPush(
    subscription: {
      endpoint: string;
      keys: {
        p256dh: string;
        auth: string;
      };
    },
    payload: {
      title: string;
      body: string;
      icon?: string;
      badge?: string;
      data?: Record<string, any>;
    },
  ): Promise<boolean> {
    const vapidPublicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const vapidSubject = this.configService.get<string>('VAPID_SUBJECT') || 'mailto:admin@yourdomain.com';

    if (!vapidPublicKey || !vapidPrivateKey) {
      this.logger.error('VAPID keys are not configured. Cannot send Web Push notification.');
      return false;
    }

    try {
      // Dynamically require web-push to avoid hard dependency
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const webPush = require('web-push') as any;

      webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

      const payloadString = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon,
        badge: payload.badge,
        data: payload.data,
      });

      await webPush.sendNotification(subscription, payloadString);

      this.logger.log(`Web Push notification sent to ${subscription.endpoint}`);
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to send Web Push notification: ${err.message}`);
      return false;
    }
  }

  /**
   * Send push notification using Firebase Cloud Messaging (FCM).
   *
   * Note: FCM requires a device token rather than a full subscription object.
   * For this demo, we assume subscription.endpoint contains the FCM token.
   */
  private async sendFcm(
    subscription: {
      endpoint: string;
      keys: {
        p256dh: string;
        auth: string;
      };
    },
    payload: {
      title: string;
      body: string;
      icon?: string;
      badge?: string;
      data?: Record<string, any>;
    },
  ): Promise<boolean> {
    const serviceAccountJson = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON');

    if (!serviceAccountJson) {
      this.logger.error('FIREBASE_SERVICE_ACCOUNT_JSON is not configured. Cannot send FCM notification.');
      return false;
    }

    try {
      // Parse service account credentials
      const raw = serviceAccountJson.startsWith('{')
        ? serviceAccountJson
        : Buffer.from(serviceAccountJson, 'base64').toString('utf8');
      const credentials = JSON.parse(raw);

      // Dynamically require firebase-admin
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const admin = require('firebase-admin') as any;

      // Initialize Firebase Admin SDK if not already initialized
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(credentials),
        });
      }

      const message = {
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.icon,
        },
        data: payload.data,
        token: subscription.endpoint, // Assuming endpoint contains FCM token
      };

      await admin.messaging().send(message);

      this.logger.log(`FCM notification sent to token ${subscription.endpoint}`);
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to send FCM notification: ${err.message}`);
      return false;
    }
  }

  /**
   * Send notifications to multiple subscriptions in batch.
   *
   * @param subscriptions Array of push subscriptions
   * @param payload Notification payload
   * @returns Array of results (true/false per subscription)
   */
  async sendBatchNotifications(
    subscriptions: Array<{
      endpoint: string;
      keys: {
        p256dh: string;
        auth: string;
      };
    }>,
    payload: {
      title: string;
      body: string;
      icon?: string;
      badge?: string;
      data?: Record<string, any>;
    },
  ): Promise<boolean[]> {
    const results = await Promise.all(
      subscriptions.map((sub) => this.sendNotification(sub, payload)),
    );

    const successCount = results.filter((r) => r).length;
    this.logger.log(
      `Batch push notifications sent: ${successCount}/${subscriptions.length} succeeded`,
    );

    return results;
  }
}
