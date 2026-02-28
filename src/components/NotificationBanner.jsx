import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

export default function NotificationBanner({ onPermissionGranted }) {
  const [showBanner, setShowBanner] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== 'undefined' ? Notification.permission : 'default'
  );

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
        // Mostrar notificação de teste
        new Notification('PreparaSNS', {
          body: 'Notificações ativadas com sucesso!',
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23005596" width="192" height="192" rx="45"/><text x="50%" y="50%" font-size="100" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">P</text></svg>',
          badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23005596" width="192" height="192" rx="45"/><text x="50%" y="50%" font-size="100" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">P</text></svg>'
        });
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificações:', error);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

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
            Receba lembretes nas horas exatas das tarefas de preparação
          </p>
          <button
            onClick={handleRequestPermission}
            className="bg-white text-primary-blue text-xs font-semibold px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Ativar Notificações
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
