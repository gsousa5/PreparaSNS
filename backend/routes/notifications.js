import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  savePushSubscription,
  deletePushSubscription,
  sendPushToUser,
  scheduleNotification,
  getPendingNotifications,
  markNotificationSent,
  markNotificationFailed
} from '../services/pushService.js';

const router = express.Router();

/**
 * POST /api/notifications/subscribe
 * Save a push subscription
 */
router.post('/subscribe', async (req, res) => {
  try {
    const { subscription, userId } = req.body;

    if (!subscription || !userId) {
      return res.status(400).json({
        error: 'Missing subscription or userId'
      });
    }

    await savePushSubscription(userId, subscription);

    res.json({ ok: true, message: 'Subscription saved' });
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({
      error: 'Failed to subscribe',
      message: err.message
    });
  }
});

/**
 * DELETE /api/notifications/subscribe
 * Remove a push subscription
 */
router.delete('/subscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        error: 'Missing endpoint'
      });
    }

    await deletePushSubscription(endpoint);

    res.json({ ok: true, message: 'Subscription removed' });
  } catch (err) {
    console.error('Unsubscribe error:', err);
    res.status(500).json({
      error: 'Failed to unsubscribe',
      message: err.message
    });
  }
});

/**
 * POST /api/notifications/schedule
 * Schedule a notification
 */
router.post('/schedule', async (req, res) => {
  try {
    const { userId, taskId, scheduledTime, title, body, data } = req.body;

    if (!userId || !taskId || !scheduledTime) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const { ok, id } = await scheduleNotification(
      userId,
      taskId,
      scheduledTime,
      title || 'PreparaSNS',
      body || 'Nova notificação',
      data || {}
    );

    if (!ok) {
      return res.status(400).json({ error: 'Failed to schedule notification' });
    }

    res.json({
      ok: true,
      jobId: id,
      message: 'Notification scheduled'
    });
  } catch (err) {
    console.error('Schedule error:', err);
    res.status(500).json({
      error: 'Failed to schedule notification',
      message: err.message
    });
  }
});

/**
 * DELETE /api/notifications/schedule/:id
 * Cancel a scheduled notification
 */
router.delete('/schedule/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'Missing notification id'
      });
    }

    // Mark as cancelled (we can also delete if needed)
    // For now, just mark as sent to skip it
    await markNotificationSent(id);

    res.json({ ok: true, message: 'Notification cancelled' });
  } catch (err) {
    console.error('Cancel error:', err);
    res.status(500).json({
      error: 'Failed to cancel notification',
      message: err.message
    });
  }
});

/**
 * GET /api/notifications/scheduled
 * Get scheduled notifications for a user
 */
router.get('/scheduled', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: 'Missing userId'
      });
    }

    // In a real app, you'd query from database
    // For now, return empty array
    res.json({
      notifications: []
    });
  } catch (err) {
    console.error('Get scheduled error:', err);
    res.status(500).json({
      error: 'Failed to get scheduled notifications',
      message: err.message
    });
  }
});

/**
 * POST /api/notifications/send
 * Send a notification immediately
 */
router.post('/send', async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'Missing userId'
      });
    }

    const result = await sendPushToUser(userId, {
      title: title || 'PreparaSNS',
      body: body || 'Nova notificação',
      data: data || {}
    });

    res.json({
      ok: true,
      sent: result.sent,
      failed: result.failed
    });
  } catch (err) {
    console.error('Send error:', err);
    res.status(500).json({
      error: 'Failed to send notification',
      message: err.message
    });
  }
});

/**
 * POST /api/notifications/test
 * Send a test notification
 */
router.post('/test', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'Missing userId'
      });
    }

    const result = await sendPushToUser(userId, {
      title: 'PreparaSNS',
      body: 'Isto é uma notificação de teste!',
      data: { test: true }
    });

    res.json({
      ok: true,
      message: 'Test notification sent',
      sent: result.sent,
      failed: result.failed
    });
  } catch (err) {
    console.error('Test notification error:', err);
    res.status(500).json({
      error: 'Failed to send test notification',
      message: err.message
    });
  }
});

/**
 * GET /api/notifications/pending
 * Get pending notifications (for background sync)
 */
router.get('/pending', async (req, res) => {
  try {
    const pending = await getPendingNotifications();

    res.json({
      notifications: pending.map(n => ({
        id: n.id,
        taskId: n.task_id,
        title: n.notification_title,
        body: n.notification_body,
        data: n.notification_data
      }))
    });
  } catch (err) {
    console.error('Get pending error:', err);
    res.status(500).json({
      error: 'Failed to get pending notifications',
      message: err.message
    });
  }
});

export default router;
