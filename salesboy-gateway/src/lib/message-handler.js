import logger from '../utils/logger.js';
import { generateHMAC } from '../utils/hmac.js';

class MessageHandler {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
    this.webhookUrl = process.env.NEXT_WEBHOOK_URL;
    this.hmacSecret = process.env.HMAC_SECRET;
  }

  setupMessageListener(userId) {
    const sessionData = this.sessionManager.getSession(userId);
    if (!sessionData) {
      logger.error(`No session found for user ${userId}`);
      return;
    }

    sessionData.client.on('message', async (message) => {
      try {
        await this.handleIncomingMessage(userId, message);
      } catch (error) {
        logger.error(`Error handling message for user ${userId}:`, error);
      }
    });

    logger.info(`Message listener set up for user ${userId}`);
  }

  async handleIncomingMessage(userId, message) {
    const payload = {
      userId,
      from: message.from,
      body: message.body,
      timestamp: message.timestamp,
      hasMedia: message.hasMedia,
      type: message.type,
      isGroup: message.from.includes('@g.us')
    };

    logger.info(`Incoming message from ${message.from} for user ${userId}`);

    await this.forwardToWebhook(payload);
  }

  async forwardToWebhook(payload) {
    if (!this.webhookUrl) {
      logger.warn('NEXT_WEBHOOK_URL not configured, skipping webhook');
      return;
    }

    const signature = generateHMAC(payload, this.hmacSecret);

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': signature
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        logger.error(`Webhook failed with status ${response.status}`);
      } else {
        logger.info('Message forwarded to webhook successfully');
      }
    } catch (error) {
      logger.error('Failed to forward message to webhook:', error);
    }
  }

  async sendMessage(userId, to, message) {
    const sessionData = this.sessionManager.getSession(userId);
    if (!sessionData || !sessionData.ready) {
      throw new Error('Session not ready');
    }

    try {
      await sessionData.client.sendMessage(to, message);
      logger.info(`Message sent to ${to} by user ${userId}`);
      return { success: true };
    } catch (error) {
      logger.error(`Failed to send message for user ${userId}:`, error);
      throw error;
    }
  }
}

export default MessageHandler;
