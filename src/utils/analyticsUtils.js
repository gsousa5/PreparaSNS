import { trackExamCompletion, trackTaskCompletion, trackSessionStart, trackSessionEnd } from '../services/historyService';

/**
 * Initialize analytics by tracking session start
 */
export const initializeAnalytics = async (userId) => {
  if (userId) {
    await trackSessionStart(userId);
  }
};

/**
 * Track when user completes an exam
 */
export const analyticsExamCompleted = async (userId, exam, completionPercentage) => {
  if (userId) {
    await trackExamCompletion(userId, exam, completionPercentage);
  }
};

/**
 * Track when user completes a task
 */
export const analyticsTaskCompleted = async (userId, examId, taskId, taskTitle) => {
  if (userId) {
    await trackTaskCompletion(userId, examId, taskId, taskTitle);
  }
};

/**
 * Track session end and duration
 */
export const analyticsSessionEnded = async (userId, sessionStartTime) => {
  if (userId && sessionStartTime) {
    const durationMs = new Date() - sessionStartTime;
    await trackSessionEnd(userId, durationMs);
  }
};

/**
 * Setup analytics tracking
 * Call this once when app initializes
 */
export const setupAnalyticsTracking = (userId) => {
  const sessionStartTime = new Date();

  // Initialize analytics
  initializeAnalytics(userId);

  // Track session end when user leaves
  const handleBeforeUnload = () => {
    analyticsSessionEnded(userId, sessionStartTime);
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  // Return cleanup function
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
};
