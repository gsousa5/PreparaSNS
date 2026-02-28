import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useAuth } from '../context/AuthContext';

export default function NotificationBanner({ onPermissionGranted }) {
  const { user } = useAuth();
  const { subscribe, unsubscribe, isSupported, isSubscribed, isLoading, error } = usePushNotifications(user?.id);
  const [showBanner, setShowBanner] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== 'undefined' ? Notification.permission : 'default'
  );
  const [pushError, setPushError] = useState(null);

  useEffect(() => {
    // Mostrar banner apenas se a permissão for negada ou padrão
    if (notificationPermission === 'default' || notificationPermission === 'denied') {
      setShowBanner(true);
    }
  }, [notificationPermission]);

  const handleRequestPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('Este navegador não suporta notificações');
      setShowBanner(false);
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        setShowBanner(false);
        onPermissionGranted?.();

        // Try to subscribe to push if supported
        if (isSupported && user?.id) {
          try {
            await subscribe();
            new Notification('PreparaSNS', {
              body: 'Push notifications ativadas! Receberá lembretes mesmo com a app fechada.',
              icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23005596" width="192" height="192" rx="45"/><text x="50%" y="50%" font-size="100" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">P</text></svg>',
              badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23005596" width="192" height="192" rx="45"/><text x="50%" y="50%" font-size="100" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">P</text></svg>'
            });
          } catch (err) {
            console.error('Erro ao subscribir a push notifications:', err);
            setPushError('Erro ao ativar push notifications');
            // Still show success for basic notifications
            new Notification('PreparaSNS', {
              body: 'Notificações ativadas com sucesso!',
              icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23005596" width="192" height="192" rx="45"/><text x="50%" y="50%" font-size="100" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">P</text></svg>',
              badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23005596" width="192" height="192" rx="45"/><text x="50%" y="50%" font-size="100" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">P</text></svg>'
            });
          }
        } else if (!isSupported) {
          // Show basic notification if push not supported
          new Notification('PreparaSNS', {
            body: 'Notificações ativadas com sucesso!',
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23005596" width="192" height="192" rx="45"/><text x="50%" y="50%" font-size="100" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">P</text></svg>',
            badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23005596" width="192" height="192" rx="45"/><text x="50%" y="50%" font-size="100" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">P</text></svg>'
          });
        }
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificações:', error);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  // Don't show if permission already granted
  if (!showBanner || notificationPermission === 'granted') {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 max-w-md mx-auto px-4 pt-4 z-50">
      <div className="bg-gradient-to-r from-primary-blue to-blue-700 text-white rounded-2xl shadow-lg p-4 flex items-start gap-3">
        <Bell className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">Ativar Notificações</h3>
          <p className="text-xs text-blue-100 mb-3">
            {isSupported
              ? 'Receba lembretes mesmo quando a app está fechada'
              : 'Receba lembretes nas horas exatas das tarefas de preparação'}
          </p>
          {pushError && (
            <p className="text-xs text-red-200 mb-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {pushError}
            </p>
          )}
          <button
            onClick={handleRequestPermission}
            disabled={isLoading}
            className="bg-white text-primary-blue text-xs font-semibold px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processando...' : 'Ativar Notificações'}
          </button>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-blue-200 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
