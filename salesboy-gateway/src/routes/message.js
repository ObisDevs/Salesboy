import express from 'express';
import MessageHandler from '../lib/message-handler.js';
import sessionManager from '../lib/session-manager.js';
import logger from '../utils/logger.js';

const router = express.Router();
const messageHandler = new MessageHandler(sessionManager);

// Send message
router.post('/send', async (req, res) => {
  const { userId, to, message } = req.body;

  if (!userId || !to || !message) {
    return res.status(400).json({ error: 'userId, to, and message are required' });
  }

  try {
    await messageHandler.sendMessage(userId, to, message);
    res.json({ success: true, message: 'Message sent' });
  } catch (error) {
    logger.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get groups
router.get('/groups', async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  const sessionData = sessionManager.getSession(user_id);
  if (!sessionData || !sessionData.ready) {
    return res.status(404).json({ error: 'Session not found or not ready' });
  }

  try {
    const chats = await sessionData.client.getChats();
    const groups = chats
      .filter(chat => chat.isGroup)
      .map(group => ({
        id: group.id._serialized,
        name: group.name
      }));

    res.json({ groups });
  } catch (error) {
    logger.error('Error getting groups:', error);
    res.status(500).json({ error: 'Failed to get groups' });
  }
});

// Get contacts
router.get('/contacts', async (req, res) => {
  const { user_ids } = req.query;

  if (!user_ids) {
    return res.status(400).json({ error: 'user_ids is required' });
  }

  const userIdArray = user_ids.split(',');
  const contacts = {};

  for (const userId of userIdArray) {
    const sessionData = sessionManager.getSession(userId);
    if (sessionData && sessionData.ready) {
      try {
        const contactList = await sessionData.client.getContacts();
        contacts[userId] = contactList.map(contact => ({
          id: contact.id._serialized,
          name: contact.name || contact.pushname,
          number: contact.number
        }));
      } catch (error) {
        logger.error(`Error getting contacts for ${userId}:`, error);
        contacts[userId] = [];
      }
    }
  }

  res.json({ contacts });
});

export default router;
