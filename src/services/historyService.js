import { supabase } from './supabaseClient';

/**
 * Record completed exam in history
 */
export const recordExamCompletion = async (userId, exam, completionData) => {
  try {
    const historyEntry = {
      id: `history_${userId}_${Date.now()}`,
      user_id: userId,
      exam_id: exam.id,
      exam_name: exam.nome,
      scheduled_date: new Date(completionData.scheduledDate).toISOString(),
      completed_at: new Date().toISOString(),
      completion_percentage: completionData.completionPercentage,
      total_tasks: completionData.totalTasks,
      completed_tasks_count: completionData.completedTasksCount,
    };

    // Save to localStorage
    const savedHistory = localStorage.getItem('preparasns-history');
    const history = savedHistory ? JSON.parse(savedHistory) : [];
    history.unshift(historyEntry);
    localStorage.setItem('preparasns-history', JSON.stringify(history));

    // Sync to Supabase in background
    if (userId) {
      supabase
        .from('exam_history')
        .insert(historyEntry)
        .catch((err) => console.error('Error recording exam history:', err));
    }

    return { data: historyEntry, error: null };
  } catch (err) {
    console.error('Error recording exam completion:', err);
    return { data: null, error: err };
  }
};

/**
 * Get exam history
 */
export const getExamHistory = async (userId) => {
  try {
    // Try Supabase first if user authenticated
    if (userId) {
      const { data, error } = await supabase
        .from('exam_history')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching history from Supabase:', error);
        // Fall through to localStorage
      } else {
        return { data: data || [], error: null };
      }
    }

    // Fall back to localStorage
    const savedHistory = localStorage.getItem('preparasns-history');
    if (savedHistory) {
      return { data: JSON.parse(savedHistory), error: null };
    }

    return { data: [], error: null };
  } catch (err) {
    console.error('Error getting exam history:', err);
    return { data: [], error: err };
  }
};

/**
 * Track analytics event
 */
export const trackAnalyticsEvent = async (userId, eventType, eventData = {}) => {
  try {
    const analyticsEvent = {
      id: `event_${userId}_${Date.now()}`,
      user_id: userId,
      event_type: eventType,
      event_data: eventData,
      event_time: new Date().toISOString(),
      session_id: sessionStorage.getItem('session_id'),
    };

    // Sync to Supabase in background (no need for localStorage)
    if (userId) {
      supabase
        .from('analytics_events')
        .insert(analyticsEvent)
        .catch((err) => console.error('Error tracking analytics:', err));
    }

    return { error: null };
  } catch (err) {
    console.error('Error tracking analytics event:', err);
    return { error: err };
  }
};

/**
 * Track exam completion event
 */
export const trackExamCompletion = async (userId, exam, completionPercentage) => {
  return trackAnalyticsEvent(userId, 'exam_completed', {
    examId: exam.id,
    examName: exam.nome,
    completionPercentage,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track task completion event
 */
export const trackTaskCompletion = async (userId, examId, taskId, taskTitle) => {
  const now = new Date();
  return trackAnalyticsEvent(userId, 'task_completed', {
    examId,
    taskId,
    taskTitle,
    dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
    hourOfDay: now.getHours(),
    timestamp: now.toISOString(),
  });
};

/**
 * Track session start
 */
export const trackSessionStart = async (userId) => {
  const sessionId = `session_${Date.now()}`;
  sessionStorage.setItem('session_id', sessionId);

  return trackAnalyticsEvent(userId, 'session_start', {
    sessionId,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track session end
 */
export const trackSessionEnd = async (userId, sessionDurationMs) => {
  const sessionId = sessionStorage.getItem('session_id');

  return trackAnalyticsEvent(userId, 'session_end', {
    sessionId,
    durationMs: sessionDurationMs,
    durationMinutes: Math.round(sessionDurationMs / 60000),
    timestamp: new Date().toISOString(),
  });
};

/**
 * Sync history from localStorage to Supabase
 */
export const syncHistoryToSupabase = async (userId) => {
  if (!userId) return { error: new Error('User not authenticated') };

  try {
    const savedHistory = localStorage.getItem('preparasns-history');
    if (!savedHistory) return { error: null };

    const history = JSON.parse(savedHistory);
    const userHistory = history.filter((h) => h.user_id === userId);

    if (userHistory.length > 0) {
      const { error } = await supabase
        .from('exam_history')
        .upsert(userHistory);

      if (error) throw error;
    }

    return { error: null };
  } catch (err) {
    console.error('Error syncing history to Supabase:', err);
    return { error: err };
  }
};
