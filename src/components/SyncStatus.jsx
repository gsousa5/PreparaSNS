import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Wifi, WifiOff, Check, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export default function SyncStatus() {
  const { isDark } = useTheme();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [lastSyncTime, setLastSyncTime] = useState(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('syncing');
      setTimeout(() => setSyncStatus('success'), 1500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show sync indicator for 3 seconds
  useEffect(() => {
    if (syncStatus === 'success') {
      const timer = setTimeout(() => setSyncStatus('idle'), 3000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus]);

  const statusConfig = {
    idle: {
      icon: isOnline ? Wifi : WifiOff,
      color: isOnline ? 'text-success-green' : 'text-warning-orange',
      label: isOnline ? 'Conectado' : 'Offline',
      bg: isOnline ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
    },
    syncing: {
      icon: Wifi,
      color: 'text-primary-blue animate-pulse',
      label: 'Sincronizando...',
      bg: 'bg-blue-100 dark:bg-blue-900/30'
    },
    success: {
      icon: Check,
      color: 'text-success-green',
      label: 'Sincronizado',
      bg: 'bg-green-100 dark:bg-green-900/30'
    },
    error: {
      icon: AlertCircle,
      color: 'text-danger-red',
      label: 'Erro - Offline',
      bg: 'bg-red-100 dark:bg-red-900/30'
    }
  };

  const config = statusConfig[syncStatus];
  const Icon = config.icon;

  return (
    <div className={clsx(
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
      config.bg,
      config.color
    )}>
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </div>
  );
}
