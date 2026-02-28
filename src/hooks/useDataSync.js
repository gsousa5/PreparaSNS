import { useEffect, useState } from 'react';
import { syncExamToSupabase } from '../services/examService';
import { syncTasksToSupabase } from '../services/taskService';
import { syncHistoryToSupabase } from '../services/historyService';
import { syncAllToSupabase } from '../services/syncService';

/**
 * Hook to manage data synchronization between localStorage and Supabase
 * Syncs data in the background without blocking UI
 */
export const useDataSync = (userId, selectedExam, examDateTime, completedTasks, history) => {
  // Sync exam data whenever selected exam changes
  useEffect(() => {
    const syncExam = async () => {
      if (userId && selectedExam && examDateTime) {
        try {
          await syncExamToSupabase(userId, selectedExam, examDateTime);
        } catch (err) {
          console.error('Error syncing exam:', err);
        }
      }
    };

    syncExam();
  }, [userId, selectedExam, examDateTime]);

  // Sync task completions whenever they change
  useEffect(() => {
    const syncTasks = async () => {
      if (userId && selectedExam && completedTasks.length > 0) {
        try {
          // Get or generate exam schedule ID
          const examScheduleId = `${userId}_${selectedExam.id}`;
          await syncTasksToSupabase(userId, examScheduleId, completedTasks);
        } catch (err) {
          console.error('Error syncing tasks:', err);
        }
      }
    };

    // Debounce sync to avoid too many requests
    const timer = setTimeout(syncTasks, 1000);
    return () => clearTimeout(timer);
  }, [userId, selectedExam, completedTasks]);

  // Sync history whenever it changes
  useEffect(() => {
    const syncHistory = async () => {
      if (userId && history.length > 0) {
        try {
          await syncHistoryToSupabase(userId);
        } catch (err) {
          console.error('Error syncing history:', err);
        }
      }
    };

    syncHistory();
  }, [userId, history]);

  // Setup online/offline sync
  useEffect(() => {
    const handleOnline = async () => {
      console.log('Back online, syncing all data...');
      if (userId) {
        try {
          await syncAllToSupabase(userId);
        } catch (err) {
          console.error('Error syncing all data:', err);
        }
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [userId]);
};

/**
 * Hook to manage network status
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
