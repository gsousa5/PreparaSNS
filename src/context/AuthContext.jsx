import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabaseClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth on component mount
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if user already has session
        const {
          data: { session: existingSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (existingSession) {
          // User already logged in
          if (isMounted) {
            setSession(existingSession);
            setUser(existingSession.user);
          }
        } else {
          // No existing session - create anonymous session
          const {
            data: { session: anonSession },
            error: anonError,
          } = await supabase.auth.signInAnonymously();

          if (anonError) throw anonError;

          if (anonSession && isMounted) {
            setSession(anonSession);
            setUser(anonSession.user);

            // Create user record in database
            try {
              const anonymousUserId = `anon_${anonSession.user.id}`;
              await supabase.from('users').insert({
                id: anonSession.user.id,
                anonymous_user_id: anonymousUserId,
                is_anonymous: true,
              });
            } catch (dbError) {
              // User record might already exist, ignore
              console.log('User record creation note:', dbError.message);
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          console.error('Auth initialization error:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (isMounted) {
        setSession(currentSession);
        setUser(currentSession?.user || null);
      }
    });

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Sign up with email
  const signUpWithEmail = async (email, password) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      // After signup, update user record to convert from anonymous
      if (data.user) {
        try {
          const anonymousUserId = user?.user_metadata?.anonymous_user_id;
          await supabase.from('users').upsert({
            id: data.user.id,
            email,
            is_anonymous: false,
            anonymous_user_id: anonymousUserId || null,
          });
        } catch (dbError) {
          console.error('Error updating user record:', dbError);
        }
      }

      return { data, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    }
  };

  // Sign in with email
  const signInWithEmail = async (email, password) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear local state
      setUser(null);
      setSession(null);

      // Create new anonymous session
      const {
        data: { session: anonSession },
        error: anonError,
      } = await supabase.auth.signInAnonymously();

      if (anonError) throw anonError;

      if (anonSession) {
        setSession(anonSession);
        setUser(anonSession.user);
      }

      return { error: null };
    } catch (err) {
      setError(err.message);
      return { error: err };
    }
  };

  // Check if user is anonymous
  const isAnonymous = user?.is_anonymous ?? true;

  const value = {
    user,
    session,
    isLoading,
    error,
    isAnonymous,
    signUpWithEmail,
    signInWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
