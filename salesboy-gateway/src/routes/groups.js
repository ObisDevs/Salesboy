import express from 'express';
import logger from '../utils/logger.js';
import { Pool } from 'pg';

const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// GET /groups?user_id=...
router.get('/', async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'user_id required' });

  try {
    const { rows } = await pool.query(
      'SELECT group_id, group_name, auto_reply, settings FROM group_settings WHERE user_id = $1',
      [userId]
    );
    res.json({ groups: rows });
  } catch (err) {
    logger.error('Failed to fetch groups:', err);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// PATCH /groups/:group_id/auto_reply
router.patch('/:group_id/auto_reply', async (req, res) => {
  const userId = req.body.user_id;
  const groupId = req.params.group_id;
  const { auto_reply } = req.body;
  if (!userId || typeof auto_reply !== 'boolean') {
    return res.status(400).json({ error: 'user_id and auto_reply required' });
  }
  try {
    await pool.query(
      'UPDATE group_settings SET auto_reply = $1 WHERE user_id = $2 AND group_id = $3',
      [auto_reply, userId, groupId]
    );
    res.json({ success: true });
  } catch (err) {
    logger.error('Failed to update auto_reply:', err);
    res.status(500).json({ error: 'Failed to update auto_reply' });
  }
});

export default router;
