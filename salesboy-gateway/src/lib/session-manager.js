import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode';
import logger from '../utils/logger.js';
import fs from 'fs';

class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.initializingUsers = new Set();
    // Safe auto-restore with delay
    this.safeRestoreExistingSessions();
  }

  safeRestoreExistingSessions() {
    try {
      const authDir = '.wwebjs_auth';
      if (!fs.existsSync(authDir)) {
        logger.info('No existing sessions to restore');
        return;
      }
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const sessions = fs.readdirSync(authDir);
      const validSessions = sessions
        .filter(dir => dir.startsWith('session-'))
        .map(dir => dir.replace('session-', ''))
        .filter(userId => uuidRegex.test(userId));
      
      if (validSessions.length === 0) {
        logger.info('No valid sessions to restore');
        return;
      }

      logger.info(`Found ${validSessions.length} session(s) to restore`);
      
      // Restore sessions ONE AT A TIME with delay to prevent memory crash
      validSessions.forEach((userId, index) => {
        setTimeout(() => {
          logger.info(`Restoring session ${index + 1}/${validSessions.length} for user ${userId}`);
          this.createSession(userId).catch(err => {
            logger.error(`Failed to restore session for ${userId}:`, err.message);
            // Don't cleanup on restore failure - user can manually reconnect
          });
        }, index * 5000); // 5 second delay between each restore
      });
    } catch (error) {
      logger.error('Error in session restore:', error);
    }
  }

  async createSession(userId) {
    // Check if already initializing
    if (this.initializingUsers.has(userId)) {
      logger.info(`Session already initializing for user ${userId}`);
      return { success: true, message: 'Session is initializing' };
    }

    // Check if session already exists and is ready
    const existing = this.sessions.get(userId);
    if (existing) {
      if (existing.ready) {
        logger.info(`Session already active for user ${userId}`);
        return { success: true, message: 'Session already active' };
      } else {
        logger.info(`Session exists but not ready for user ${userId}`);
        return { success: true, message: 'Session connecting' };
      }
    }

    this.initializingUsers.add(userId);

    const client = new Client({
      authStrategy: new LocalAuth({ clientId: userId }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      }
    });

    const sessionData = {
      client,
      qr: null,
      ready: false,
      qrListeners: [],
      myNumber: null
    };

    client.on('qr', async (qr) => {
      logger.info(`QR code generated for user ${userId}`);
      sessionData.qr = qr;
      
      sessionData.qrListeners.forEach(listener => {
        listener(qr);
      });
    });

    client.on('ready', async () => {
      logger.info(`✅ WhatsApp client ready for user ${userId}`);
      sessionData.ready = true;
      sessionData.qr = null; // Clear QR once connected
      this.initializingUsers.delete(userId);
      
      try {
        const info = await client.info;
        sessionData.myNumber = info?.wid?._serialized;
        logger.info(`User ${userId} connected with number: ${sessionData.myNumber}`);
      } catch (err) {
        logger.error(`Failed to get WhatsApp number for ${userId}:`, err);
      }
    });

    client.on('authenticated', () => {
      logger.info(`User ${userId} authenticated`);
    });

    client.on('auth_failure', (msg) => {
      logger.error(`Auth failure for user ${userId}: ${msg}`);
      this.sessions.delete(userId);
      this.initializingUsers.delete(userId);
      // DON'T delete auth folder on auth_failure - might be temporary
    });

    client.on('disconnected', (reason) => {
      logger.warn(`User ${userId} disconnected: ${reason}`);
      this.sessions.delete(userId);
      this.initializingUsers.delete(userId);
      // DON'T delete auth folder - user can reconnect
    });

    client.on('message', async (message) => {
      if (sessionData.myNumber && message.to && message.to !== sessionData.myNumber) {
        return;
      }
      
      if (message.from.includes('@broadcast') || message.from.includes('status@')) {
        return;
      }
      
      logger.info(`Message from ${message.from} for user ${userId}`);
      
      try {
        const webhookUrl = process.env.NEXT_WEBHOOK_URL;
        if (webhookUrl) {
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-signature': 'temp-signature'
            },
            body: JSON.stringify({
              user_id: userId,
              from: message.from,
              message: message.body,
              timestamp: message.timestamp
            })
          });
          
          if (!response.ok) {
            logger.error(`Webhook error: ${response.status}`);
          }
        }
      } catch (error) {
        logger.error(`Failed to forward message:`, error);
      }
    });

    this.sessions.set(userId, sessionData);

    try {
      await client.initialize();
      return { success: true, message: 'Session initialized' };
    } catch (error) {
      logger.error(`Failed to initialize session for ${userId}:`, error.message);
      this.sessions.delete(userId);
      this.initializingUsers.delete(userId);
      // DON'T delete auth folder - let user try again
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
      this.initializingUsers.delete(userId);
      
      // Delete auth folder when user explicitly stops
      const authPath = `.wwebjs_auth/session-${userId}`;
      if (fs.existsSync(authPath)) {
        fs.rmSync(authPath, { recursive: true, force: true });
        logger.info(`Deleted auth for ${userId}`);
      }
      
      logger.info(`Session stopped for ${userId}`);
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
    if (!sessionData || !sessionData.qr || sessionData.ready) {
      return null; // No QR if session doesn't exist, no QR available, or already connected
    }
    
    return await qrcode.toDataURL(sessionData.qr);
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
