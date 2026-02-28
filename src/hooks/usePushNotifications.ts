import { useEffect, useState, useCallback } from 'react';

// Convert VAPID public key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

interface PushSubscriptionJSON {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const usePushNotifications = (userId: string | undefined) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  // Check browser support
  useEffect(() => {
    const supported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;
    setIsSupported(supported);
  }, []);

  // Get current subscription status
  const checkSubscription = useCallback(async () => {
    try {
      if (!('serviceWorker' in navigator)) return;

      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();

      setSubscription(sub);
      setIsSubscribed(!!sub);
    } catch (err) {
      console.error('Error checking subscription:', err);
      setError('Erro ao verificar subscrição');
    }
  }, []);

  // Initial subscription check
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!userId) {
      setError('Utilizador não identificado');
      return false;
    }

    if (!isSupported) {
      setError('Notificações push não suportadas neste navegador');
      return false;
    }

    if (Notification.permission !== 'granted') {
      setError('Permissão de notificações não concedida');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const registration = await navigator.serviceWorker.ready;
      const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

      if (!publicKey) {
        throw new Error('VAPID public key not found');
      }

      // Subscribe to push manager
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      // Send subscription to backend
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          userId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription on server');
      }

      setSubscription(sub);
      setIsSubscribed(true);

      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao subscrever notificações';
      console.error('Push subscription error:', err);
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, isSupported]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!subscription) {
        setError('Sem subscrição ativa');
        return false;
      }

      // Unsubscribe from push manager
      const success = await subscription.unsubscribe();

      if (!success) {
        throw new Error('Failed to unsubscribe from push manager');
      }

      // Notify backend
      const response = await fetch('/api/notifications/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscription.endpoint
        })
      });

      if (!response.ok) {
        console.warn('Failed to delete subscription on server, but unsubscribed locally');
      }

      setSubscription(null);
      setIsSubscribed(false);

      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao remover subscrição';
      console.error('Push unsubscription error:', err);
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [subscription]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    subscription,
    subscribe,
    unsubscribe,
    checkSubscription
  };
};
