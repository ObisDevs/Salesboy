import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /groups?user_id=... - Returns empty for now (groups handled by core backend)
router.get('/', async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'user_id required' });
  
  res.json({ groups: [] });
});

export default router;
