import express from 'express';
import sessionManager from '../lib/session-manager.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Start session
router.post('/start', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const result = await sessionManager.createSession(userId);
    res.json(result);
  } catch (error) {
    logger.error('Error starting session:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// Stop session
router.post('/stop', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const result = await sessionManager.stopSession(userId);
    res.json(result);
  } catch (error) {
    logger.error('Error stopping session:', error);
    res.status(500).json({ error: 'Failed to stop session' });
  }
});

// Get session status
router.get('/status/:userId', async (req, res) => {
  const { userId } = req.params;
  const status = sessionManager.getSessionStatus(userId);
  const qr = await sessionManager.getQRCode(userId);
  res.json({ ...status, qr });
});

// Get QR code (SSE)
router.get('/qr/:userId', async (req, res) => {
  const { userId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendQR = async (qr) => {
    const qrDataURL = await sessionManager.getQRCode(userId);
    if (qrDataURL) {
      res.write(`data: ${JSON.stringify({ qr: qrDataURL })}\n\n`);
    }
  };

  sessionManager.addQRListener(userId, sendQR);

  // Send initial QR if available
  const initialQR = await sessionManager.getQRCode(userId);
  if (initialQR) {
    res.write(`data: ${JSON.stringify({ qr: initialQR })}\n\n`);
  }

  req.on('close', () => {
    sessionManager.removeQRListener(userId, sendQR);
  });
});

export default router;
