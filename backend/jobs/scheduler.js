import schedule from 'node-schedule';
import {
  getPendingNotifications,
  sendPushToUser,
  markNotificationSent,
  markNotificationFailed,
  updateSubscriptionLastUsed
} from '../services/pushService.js';

let schedulerRunning = false;

/**
 * Process pending notifications and send them
 */
export const processPendingNotifications = async () => {
  try {
    const pending = await getPendingNotifications();

    if (pending.length === 0) {
      return;
    }

    console.log(`Processing ${pending.length} pending notifications`);

    for (const notification of pending) {
      try {
        // Send push notification
        const result = await sendPushToUser(notification.user_id, {
          title: notification.notification_title,
          body: notification.notification_body,
          data: {
            ...notification.notification_data,
            taskId: notification.task_id
          }
        });

        // Mark as sent if at least one subscription received it
        if (result.sent > 0) {
          await markNotificationSent(notification.id);
          console.log(`Notification ${notification.id} sent to ${result.sent} subscriptions`);
        } else if (result.failed.length > 0) {
          // All subscriptions failed
          await markNotificationFailed(
            notification.id,
            `All ${result.failed.length} subscriptions failed`
          );
        }
      } catch (err) {
        console.error(`Error processing notification ${notification.id}:`, err);
        await markNotificationFailed(notification.id, err.message);
      }
    }
  } catch (err) {
    console.error('Error in processPendingNotifications:', err);
  }
};

/**
 * Start the notification scheduler
 * Runs every 30 seconds by default
 */
export const startNotificationScheduler = () => {
  if (schedulerRunning) {
    console.warn('Scheduler is already running');
    return;
  }

  const interval = parseInt(process.env.NOTIFICATION_CHECK_INTERVAL || '30000', 10);
  const intervalSeconds = Math.max(10, Math.floor(interval / 1000)); // Minimum 10 seconds

  console.log(`Starting notification scheduler (interval: ${intervalSeconds}s)`);

  // Run immediately on start
  processPendingNotifications();

  // Then schedule recurring job
  const job = schedule.scheduleJob(`*/${intervalSeconds} * * * * *`, () => {
    processPendingNotifications();
  });

  schedulerRunning = true;

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('Stopping notification scheduler');
    job.cancel();
    schedulerRunning = false;
  });

  process.on('SIGINT', () => {
    console.log('Stopping notification scheduler');
    job.cancel();
    schedulerRunning = false;
  });

  return job;
};

/**
 * Stop the notification scheduler
 */
export const stopNotificationScheduler = () => {
  schedulerRunning = false;
  console.log('Notification scheduler stopped');
};

/**
 * Check if scheduler is running
 */
export const isSchedulerRunning = () => {
  return schedulerRunning;
};
