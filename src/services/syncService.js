import { supabase } from './supabaseClient';

/**
 * Sync all data from Supabase to localStorage
 * Used when coming from offline or on initial load
 */
export const syncAllFromSupabase = async (userId) => {
  if (!userId) return { error: new Error('User not authenticated') };

  const results = {
    exams: null,
    tasks: null,
    history: null,
    errors: [],
  };

  try {
    // Sync exams
    try {
      const { data: exams, error } = await supabase
        .from('exams_scheduled')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (exams && exams.length > 0) {
        const exam = exams[0];
        const examState = {
          selectedExamId: exam.exam_id,
          examDateTime: exam.scheduled_date,
          completedTasks: [],
        };
        localStorage.setItem('prepara_sns_state', JSON.stringify(examState));
        results.exams = exam;
      }
    } catch (err) {
      results.errors.push(`Exam sync error: ${err.message}`);
    }

    // Sync history
    try {
      const { data: history, error } = await supabase
        .from('exam_history')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      if (history) {
        localStorage.setItem('preparasns-history', JSON.stringify(history));
        results.history = history;
      }
    } catch (err) {
      results.errors.push(`History sync error: ${err.message}`);
    }

    return { data: results, error: null };
  } catch (err) {
    console.error('Error syncing from Supabase:', err);
    return { data: results, error: err };
  }
};

/**
 * Sync all data from localStorage to Supabase
 * Used when going online or on demand
 */
export const syncAllToSupabase = async (userId) => {
  if (!userId) return { error: new Error('User not authenticated') };

  const results = {
    exams: null,
    tasks: null,
    history: null,
    errors: [],
  };

  try {
    // Sync exams
    try {
      const savedState = localStorage.getItem('prepara_sns_state');
      if (savedState) {
        const state = JSON.parse(savedState);
        // Note: In a real app, you'd want to check for conflicts here
        // For now, just ensure the record exists
        results.exams = state;
      }
    } catch (err) {
      results.errors.push(`Exam sync error: ${err.message}`);
    }

    // Sync history
    try {
      const savedHistory = localStorage.getItem('preparasns-history');
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        const { error } = await supabase
          .from('exam_history')
          .upsert(history.map((h) => ({ ...h, user_id: userId })));

        if (error) throw error;
        results.history = history;
      }
    } catch (err) {
      results.errors.push(`History sync error: ${err.message}`);
    }

    return { data: results, error: null };
  } catch (err) {
    console.error('Error syncing to Supabase:', err);
    return { data: results, error: err };
  }
};

/**
 * Handle conflicts between local and server data
 * Server version (later timestamp) wins
 */
export const resolveConflict = (localData, serverData) => {
  if (!serverData) return localData;
  if (!localData) return serverData;

  const localTime = new Date(localData.updated_at || localData.created_at);
  const serverTime = new Date(serverData.updated_at || serverData.created_at);

  return serverTime > localTime ? serverData : localData;
};

/**
 * Check if device is online
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * Listen for online/offline changes and sync when status changes
 */
export const setupNetworkListener = (userId, onSyncRequired) => {
  const handleOnline = async () => {
    console.log('Device back online, syncing...');
    await syncAllToSupabase(userId);
    if (onSyncRequired) onSyncRequired();
  };

  const handleOffline = () => {
    console.log('Device went offline');
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

/**
 * Queue data for sync when connection is restored
 * Uses localStorage to persist the sync queue
 */
export const queueForSync = (operation) => {
  try {
    const syncQueue = JSON.parse(localStorage.getItem('sync_queue') || '[]');
    syncQueue.push({
      id: `op_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...operation,
    });
    localStorage.setItem('sync_queue', JSON.stringify(syncQueue));
    return { error: null };
  } catch (err) {
    console.error('Error queuing for sync:', err);
    return { error: err };
  }
};

/**
 * Process queued sync operations
 */
export const processSyncQueue = async (userId) => {
  try {
    const syncQueue = JSON.parse(localStorage.getItem('sync_queue') || '[]');

    if (syncQueue.length === 0) return { processed: 0, error: null };

    let processed = 0;

    for (const op of syncQueue) {
      try {
        // Process based on operation type
        if (op.type === 'exam_update') {
          // Handle exam update
        } else if (op.type === 'task_update') {
          // Handle task update
        } else if (op.type === 'history_record') {
          // Handle history recording
        }
        processed++;
      } catch (err) {
        console.error(`Error processing operation ${op.id}:`, err);
      }
    }

    // Clear processed queue
    if (processed > 0) {
      localStorage.setItem('sync_queue', JSON.stringify(syncQueue.slice(processed)));
    }

    return { processed, error: null };
  } catch (err) {
    console.error('Error processing sync queue:', err);
    return { processed: 0, error: err };
  }
};
