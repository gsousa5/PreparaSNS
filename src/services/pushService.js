/**
 * Frontend service for push notification operations
 * Communicates with backend API
 */

/**
 * Schedule a push notification for a specific task
 */
export const schedulePushNotification = async (userId, taskId, scheduledTime, taskData) => {
  try {
    const response = await fetch('/api/notifications/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        taskId,
        scheduledTime: new Date(scheduledTime).toISOString(),
        title: 'PreparaSNS - Tarefa de Preparação',
        body: taskData.title,
        data: {
          taskId,
          examId: taskData.examId,
          description: taskData.description
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Falha ao agendar notificação');
    }

    const result = await response.json();
    return { ok: true, jobId: result.jobId };
  } catch (err) {
    console.error('Push notification scheduling error:', err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Erro desconhecido'
    };
  }
};

/**
 * Cancel a scheduled notification
 */
export const cancelPushNotification = async (notificationId) => {
  try {
    const response = await fetch(`/api/notifications/schedule/${notificationId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Falha ao cancelar notificação');
    }

    return { ok: true };
  } catch (err) {
    console.error('Push notification cancellation error:', err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Erro desconhecido'
    };
  }
};

/**
 * Get all scheduled notifications for user
 */
export const getScheduledNotifications = async (userId) => {
  try {
    const response = await fetch(`/api/notifications/scheduled?userId=${userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error('Falha ao obter notificações agendadas');
    }

    const result = await response.json();
    return { ok: true, notifications: result.notifications };
  } catch (err) {
    console.error('Get scheduled notifications error:', err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Erro desconhecido',
      notifications: []
    };
  }
};

/**
 * Send a test push notification
 */
export const sendTestNotification = async (userId) => {
  try {
    const response = await fetch('/api/notifications/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Falha ao enviar notificação de teste');
    }

    return { ok: true };
  } catch (err) {
    console.error('Test notification error:', err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Erro desconhecido'
    };
  }
};

/**
 * Fallback: Schedule client-side notification when push fails
 */
export const scheduleClientNotification = (taskTitle, scheduledTime) => {
  const timeout = new Date(scheduledTime).getTime() - Date.now();

  if (timeout <= 0) {
    console.warn('Scheduled time is in the past');
    return null;
  }

  const timeoutId = setTimeout(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('PreparaSNS - Tarefa de Preparação', {
        body: taskTitle,
        icon: '/logo-192.png',
        badge: '/logo-64.png',
        requireInteraction: true,
        tag: `fallback-${Date.now()}`
      });
    }
  }, timeout);

  return timeoutId;
};

/**
 * Trigger background sync for pending notifications (when going online)
 */
export const triggerBackgroundSync = async () => {
  try {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return { ok: false };
    }

    const registration = await navigator.serviceWorker.ready;

    if (!('sync' in registration)) {
      console.warn('Background Sync API not supported');
      return { ok: false };
    }

    await registration.sync.register('sync-notifications');
    return { ok: true };
  } catch (err) {
    console.error('Background sync trigger error:', err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Erro desconhecido'
    };
  }
};

/**
 * Get push subscription status
 */
export const getPushStatus = async () => {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return {
        isSupported: false,
        isSubscribed: false,
        permission: 'denied'
      };
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    const permission = Notification.permission;

    return {
      isSupported: true,
      isSubscribed: !!subscription,
      permission
    };
  } catch (err) {
    console.error('Get push status error:', err);
    return {
      isSupported: false,
      isSubscribed: false,
      permission: 'denied'
    };
  }
};
