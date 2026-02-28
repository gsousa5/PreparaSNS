import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// Lazy-loaded Supabase client
let supabase = null;

function getSupabaseClient() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error('Missing Supabase configuration: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }

    supabase = createClient(url, key);
  }
  return supabase;
}

// Configure web-push only when needed
function configureWebPush() {
  try {
    const subject = process.env.VAPID_SUBJECT;
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (!subject || !publicKey || !privateKey) {
      throw new Error('Missing VAPID configuration');
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);
  } catch (err) {
    console.error('Web-push configuration error:', err.message);
  }
}

export const getUserSubscriptions = async (userId) => {
  try {
    const { data, error } = await getSupabaseClient()
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error getting user subscriptions:', err);
    return [];
  }
};

/**
 * Save push subscription
 */
export const savePushSubscription = async (userId, subscriptionJson) => {
  try {
    const { data, error } = await getSupabaseClient()
      .from('push_subscriptions')
      .insert({
        user_id: userId,
        endpoint: subscriptionJson.endpoint,
        p256dh: subscriptionJson.keys.p256dh,
        auth: subscriptionJson.keys.auth
      });

    if (error) throw error;
    return { ok: true };
  } catch (err) {
    console.error('Error saving subscription:', err);
    throw err;
  }
};

/**
 * Delete push subscription
 */
export const deletePushSubscription = async (endpoint) => {
  try {
    const { error } = await getSupabaseClient()
      .from('push_subscriptions')
      .update({ is_active: false })
      .eq('endpoint', endpoint);

    if (error) throw error;
    return { ok: true };
  } catch (err) {
    console.error('Error deleting subscription:', err);
    throw err;
  }
};

/**
 * Send push notification
 */
export const sendPushNotification = async (subscription, payload) => {
  try {
    configureWebPush();
    const subscriptionObj = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth
      }
    };

    await webpush.sendNotification(subscriptionObj, JSON.stringify(payload));
    return { ok: true };
  } catch (err) {
    console.error('Error sending push notification:', err);

    // If subscription is invalid, mark as inactive
    if (err.statusCode === 410 || err.statusCode === 404) {
      await deletePushSubscription(subscription.endpoint);
    }

    throw err;
  }
};

/**
 * Send push to all user subscriptions
 */
export const sendPushToUser = async (userId, payload) => {
  const subscriptions = await getUserSubscriptions(userId);
  const results = { sent: 0, failed: [] };

  for (const subscription of subscriptions) {
    try {
      await sendPushNotification(subscription, payload);
      results.sent++;
    } catch (err) {
      results.failed.push({
        endpoint: subscription.endpoint,
        error: err.message
      });
    }
  }

  return results;
};

/**
 * Schedule a notification
 */
export const scheduleNotification = async (
  userId,
  taskId,
  scheduledTime,
  title,
  body,
  data
) => {
  try {
    const { data: result, error } = await getSupabaseClient()
      .from('scheduled_notifications')
      .insert({
        user_id: userId,
        task_id: taskId,
        scheduled_time: new Date(scheduledTime).toISOString(),
        notification_title: title,
        notification_body: body,
        notification_data: data,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return { ok: true, id: result.id };
  } catch (err) {
    console.error('Error scheduling notification:', err);
    throw err;
  }
};

/**
 * Get pending notifications
 */
export const getPendingNotifications = async (beforeTime = new Date()) => {
  try {
    const { data, error } = await getSupabaseClient()
      .from('scheduled_notifications')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_time', beforeTime.toISOString())
      .order('scheduled_time', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error getting pending notifications:', err);
    return [];
  }
};

/**
 * Mark notification as sent
 */
export const markNotificationSent = async (notificationId) => {
  try {
    const { error } = await getSupabaseClient()
      .from('scheduled_notifications')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    if (error) throw error;
    return { ok: true };
  } catch (err) {
    console.error('Error marking notification as sent:', err);
    throw err;
  }
};

/**
 * Mark notification as failed
 */
export const markNotificationFailed = async (notificationId, errorMessage) => {
  try {
    const { error } = await getSupabaseClient()
      .from('scheduled_notifications')
      .update({
        status: 'failed',
        error_message: errorMessage
      })
      .eq('id', notificationId);

    if (error) throw error;
    return { ok: true };
  } catch (err) {
    console.error('Error marking notification as failed:', err);
    throw err;
  }
};

/**
 * Update last used timestamp
 */
export const updateSubscriptionLastUsed = async (endpoint) => {
  try {
    await getSupabaseClient()
      .from('push_subscriptions')
      .update({ last_used: new Date().toISOString() })
      .eq('endpoint', endpoint);
  } catch (err) {
    console.error('Error updating last_used:', err);
  }
};
