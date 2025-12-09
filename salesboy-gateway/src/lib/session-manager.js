import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode';
import logger from '../utils/logger.js';
import fs from 'fs';
import path from 'path';

class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.restoreExistingSessions();
  }

  restoreExistingSessions() {
    try {
      const authDir = '.wwebjs_auth';
      if (!fs.existsSync(authDir)) return;
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const sessions = fs.readdirSync(authDir);
      
      sessions.forEach(sessionDir => {
        if (sessionDir.startsWith('session-')) {
          const userId = sessionDir.replace('session-', '');
          
          if (uuidRegex.test(userId)) {
            logger.info(`Restoring session for user ${userId}`);
            this.createSession(userId).catch(err => 
              logger.error(`Failed to restore session for ${userId}:`, err)
            );
          } else {
            logger.warn(`Skipping invalid session: ${sessionDir}`);
          }
        }
      });
    } catch (error) {
      logger.error('Error restoring sessions:', error);
    }
  }

  async createSession(userId) {
    if (this.sessions.has(userId)) {
      logger.info(`Session already exists for user ${userId}`);
      return { success: true, message: 'Session already exists' };
    }

    const client = new Client({
      authStrategy: new LocalAuth({ clientId: userId }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    const sessionData = {
      client,
      qr: null,
      ready: false,
      qrListeners: []
    };

    client.on('qr', async (qr) => {
      logger.info(`QR code generated for user ${userId}`);
      sessionData.qr = qr;
      
      sessionData.qrListeners.forEach(listener => {
        listener(qr);
      });
    });

    client.on('ready', () => {
      logger.info(`WhatsApp client ready for user ${userId}`);
      sessionData.ready = true;
    });

    client.on('authenticated', () => {
      logger.info(`User ${userId} authenticated`);
    });

    client.on('auth_failure', (msg) => {
      logger.error(`Auth failure for user ${userId}: ${msg}`);
    });

    client.on('disconnected', (reason) => {
      logger.warn(`User ${userId} disconnected: ${reason}`);
      this.sessions.delete(userId);
    });

    client.on('message', async (message) => {
      logger.info(`Message received from ${message.from}: ${message.body}`);
      
      // Forward to webhook
      try {
        const webhookUrl = process.env.NEXT_WEBHOOK_URL;
        if (webhookUrl) {
          const payload = {
            user_id: userId,
            from: message.from,
            message: message.body,
            timestamp: message.timestamp
          };
          
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-signature': 'temp-signature' // Temporary - will fix HMAC later
            },
            body: JSON.stringify(payload)
          });
          logger.info(`Message forwarded to webhook: ${response.status}`);
          
          if (!response.ok) {
            const errorText = await response.text();
            logger.error(`Webhook error response: ${errorText}`);
          }
        }
      } catch (error) {
        logger.error(`Failed to forward message to webhook:`, error);
      }
    });

    this.sessions.set(userId, sessionData);

    try {
      await client.initialize();
      return { success: true, message: 'Session initialized' };
    } catch (error) {
      logger.error(`Failed to initialize session for ${userId}:`, error);
      this.sessions.delete(userId);
      return { success: false, message: error.message };
    }
  }

  async stopSession(userId) {
    const sessionData = this.sessions.get(userId);
    if (!sessionData) {
      return { success: false, message: 'Session not found' };
    }

    try {
      await sessionData.client.destroy();
      this.sessions.delete(userId);
      logger.info(`Session stopped for user ${userId}`);
      return { success: true, message: 'Session stopped' };
    } catch (error) {
      logger.error(`Failed to stop session for ${userId}:`, error);
      return { success: false, message: error.message };
    }
  }

  getSession(userId) {
    return this.sessions.get(userId);
  }

  getSessionStatus(userId) {
    const sessionData = this.sessions.get(userId);
    if (!sessionData) {
      return { exists: false, ready: false };
    }
    return { exists: true, ready: sessionData.ready };
  }

  async getQRCode(userId) {
    const sessionData = this.sessions.get(userId);
    if (!sessionData) {
      return null;
    }
    
    if (sessionData.qr) {
      return await qrcode.toDataURL(sessionData.qr);
    }
    
    return null;
  }

  addQRListener(userId, listener) {
    const sessionData = this.sessions.get(userId);
    if (sessionData) {
      sessionData.qrListeners.push(listener);
    }
  }

  removeQRListener(userId, listener) {
    const sessionData = this.sessions.get(userId);
    if (sessionData) {
      sessionData.qrListeners = sessionData.qrListeners.filter(l => l !== listener);
    }
  }
}

export default new SessionManager();
