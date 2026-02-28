import { supabase } from './supabaseClient';

/**
 * Update task completion status locally and in Supabase
 */
export const updateTaskCompletion = async (userId, examScheduleId, taskId, isCompleted) => {
  try {
    // Update localStorage immediately
    const savedState = localStorage.getItem('prepara_sns_state');
    if (savedState) {
      const state = JSON.parse(savedState);
      if (isCompleted) {
        if (!state.completedTasks.includes(taskId)) {
          state.completedTasks.push(taskId);
        }
      } else {
        state.completedTasks = state.completedTasks.filter((id) => id !== taskId);
      }
      localStorage.setItem('prepara_sns_state', JSON.stringify(state));
    }

    // Sync to Supabase in background
    if (userId && examScheduleId) {
      supabase
        .from('task_completions')
        .upsert({
          id: `${examScheduleId}_${taskId}`,
          user_id: userId,
          exam_schedule_id: examScheduleId,
          task_id: taskId,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .catch((err) => console.error('Error syncing task to Supabase:', err));
    }

    return { error: null };
  } catch (err) {
    console.error('Error updating task completion:', err);
    return { error: err };
  }
};

/**
 * Get task completion status for an exam
 */
export const getTaskCompletions = async (userId, examScheduleId) => {
  try {
    // Try Supabase if user authenticated
    if (userId && examScheduleId) {
      const { data, error } = await supabase
        .from('task_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('exam_schedule_id', examScheduleId);

      if (error) {
        console.error('Error fetching task completions:', error);
        return { data: [], error };
      }

      return { data: data || [], error: null };
    }

    // Fall back to localStorage
    const savedState = localStorage.getItem('prepara_sns_state');
    if (savedState) {
      const state = JSON.parse(savedState);
      return { data: state.completedTasks || [], error: null };
    }

    return { data: [], error: null };
  } catch (err) {
    console.error('Error getting task completions:', err);
    return { data: [], error: err };
  }
};

/**
 * Sync task completions from localStorage to Supabase
 */
export const syncTasksToSupabase = async (userId, examScheduleId, completedTaskIds) => {
  if (!userId || !examScheduleId) {
    return { error: new Error('Missing userId or examScheduleId') };
  }

  try {
    const taskCompletions = completedTaskIds.map((taskId) => ({
      id: `${examScheduleId}_${taskId}`,
      user_id: userId,
      exam_schedule_id: examScheduleId,
      task_id: taskId,
      is_completed: true,
      completed_at: new Date().toISOString(),
    }));

    if (taskCompletions.length > 0) {
      const { error } = await supabase
        .from('task_completions')
        .upsert(taskCompletions);

      if (error) throw error;
    }

    return { error: null };
  } catch (err) {
    console.error('Error syncing tasks to Supabase:', err);
    return { error: err };
  }
};

/**
 * Clear all task completions for an exam schedule
 */
export const clearTaskCompletions = async (userId, examScheduleId) => {
  if (!userId || !examScheduleId) {
    return { error: new Error('Missing userId or examScheduleId') };
  }

  try {
    const { error } = await supabase
      .from('task_completions')
      .delete()
      .eq('user_id', userId)
      .eq('exam_schedule_id', examScheduleId);

    if (error) throw error;

    return { error: null };
  } catch (err) {
    console.error('Error clearing task completions:', err);
    return { error: err };
  }
};
