import { supabase } from './supabaseClient';

/**
 * Save scheduled exam to Supabase and localStorage
 */
export const saveScheduledExam = async (userId, exam, examDateTime) => {
  try {
    // Save to localStorage immediately (for offline support)
    const localState = {
      selectedExamId: exam.id,
      examDateTime,
      completedTasks: [],
    };
    localStorage.setItem('prepara_sns_state', JSON.stringify(localState));

    // Sync to Supabase in background (don't await)
    if (userId) {
      supabase
        .from('exams_scheduled')
        .insert({
          id: `${userId}_${exam.id}_${Date.now()}`,
          user_id: userId,
          exam_id: exam.id,
          exam_name: exam.nome,
          scheduled_date: new Date(examDateTime).toISOString(),
        })
        .catch((err) => console.error('Error syncing exam to Supabase:', err));
    }

    return { data: localState, error: null };
  } catch (err) {
    console.error('Error saving exam:', err);
    return { data: null, error: err };
  }
};

/**
 * Get scheduled exam from localStorage (primary source)
 * Falls back to Supabase if localStorage is empty
 */
export const getScheduledExam = async (userId) => {
  try {
    // Try localStorage first (offline mode)
    const savedState = localStorage.getItem('prepara_sns_state');
    if (savedState) {
      return { data: JSON.parse(savedState), error: null };
    }

    // If no local data and user is authenticated, fetch from Supabase
    if (userId) {
      const { data, error } = await supabase
        .from('exams_scheduled')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is ok
        console.error('Error fetching exam from Supabase:', error);
      }

      if (data) {
        return {
          data: {
            selectedExamId: data.exam_id,
            examDateTime: data.scheduled_date,
            completedTasks: [],
          },
          error: null,
        };
      }
    }

    return { data: null, error: null };
  } catch (err) {
    console.error('Error getting exam:', err);
    return { data: null, error: err };
  }
};

/**
 * Clear scheduled exam from localStorage and Supabase
 */
export const clearScheduledExam = async (userId) => {
  try {
    // Clear from localStorage
    localStorage.removeItem('prepara_sns_state');

    // Clear from Supabase if user authenticated
    if (userId) {
      await supabase
        .from('exams_scheduled')
        .delete()
        .eq('user_id', userId)
        .catch((err) => console.error('Error clearing exam from Supabase:', err));
    }

    return { error: null };
  } catch (err) {
    console.error('Error clearing exam:', err);
    return { error: err };
  }
};

/**
 * Sync exam state from localStorage to Supabase
 * Used when coming online or on demand
 */
export const syncExamToSupabase = async (userId, exam, examDateTime) => {
  if (!userId) return { error: new Error('User not authenticated') };

  try {
    const examRecord = {
      id: `${userId}_${exam.id}_${Date.now()}`,
      user_id: userId,
      exam_id: exam.id,
      exam_name: exam.nome,
      scheduled_date: new Date(examDateTime).toISOString(),
    };

    const { error } = await supabase
      .from('exams_scheduled')
      .insert(examRecord);

    if (error) throw error;

    return { data: examRecord, error: null };
  } catch (err) {
    console.error('Error syncing exam to Supabase:', err);
    return { data: null, error: err };
  }
};
