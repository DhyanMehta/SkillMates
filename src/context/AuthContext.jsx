import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const [isEmailVerificationPending, setIsEmailVerificationPending] = useState(false);

  useEffect(() => {
    // Set a maximum loading time of 10 seconds
    const loadingTimeout = setTimeout(() => {
      console.log('Auth loading timeout reached, proceeding without auth');
      setLoading(false);
    }, 10000);

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setSession(session);
          setUser(session.user);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        clearTimeout(loadingTimeout);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        clearTimeout(loadingTimeout);

        console.log('Auth state change:', { event, hasUser: !!session?.user, emailConfirmed: session?.user?.email_confirmed_at });

        if (session?.user) {
          // For SIGNED_UP event, only set user state if email is confirmed
          // For SIGNED_IN event, always set user state (user has logged in with verified credentials)
          if (event === 'SIGNED_UP' && !session.user.email_confirmed_at) {
            console.log('SIGNED_UP event but email not confirmed, not setting user state');
            setLoading(false);
            return;
          }

          // Set user state for confirmed users or successful sign-ins
          setSession(session);
          setUser(session.user);
          setIsEmailVerificationPending(false);
        } else {
          setSession(null);
          setUser(null);
          setIsEmailVerificationPending(false);
        }

        setLoading(false);
      }
    );

    return () => {
      clearTimeout(loadingTimeout);
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) {
        setError(error.message);
        return { success: false, message: error.message };
      }

      // Check if user email is confirmed
      const emailConfirmed = data.user?.email_confirmed_at;
      const hasSession = !!data.session;

      if (!emailConfirmed && !hasSession) {
        // Email confirmation is enabled - user needs to verify email
        // DO NOT set user state yet - wait for email confirmation
        setIsEmailVerificationPending(true);
        return {
          success: true,
          needsEmailVerification: true,
          message: `Registration successful! Please check ${email} for verification email.`,
          email: email
        };
      } else {
        // User is immediately confirmed (email confirmation disabled)
        // Only set user state when they are fully authenticated
        setUser(data.user);
        if (data.session) {
          setSession(data.session);
        }
        setIsEmailVerificationPending(false);
        return { success: true, user: data.user, needsEmailVerification: false };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error.message);
        return { success: false, message: error.message };
      }

      // Check if email is confirmed
      if (!data.user?.email_confirmed_at) {
        return {
          success: false,
          needsEmailVerification: true,
          message: 'Please verify your email before signing in.',
          email: email
        };
      }

      setUser(data.user);
      setSession(data.session);
      return { success: true, user: data.user };
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
        return { success: false, message: error.message };
      }

      setUser(null);
      setSession(null);
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (email, token) => {
    try {
      setLoading(true);
      setError(null);

      // Add timeout to prevent hanging
      const otpPromise = supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('OTP verification timeout')), 10000)
      );

      const { data, error } = await Promise.race([otpPromise, timeoutPromise]);

      if (error) {
        let userMessage = error.message;

        // More specific error messages
        if (error.message?.includes('expired') || error.message?.includes('Token has expired')) {
          userMessage = 'OTP has expired. Please request a new one.';
        } else if (error.message?.includes('invalid') || error.message?.includes('Invalid token')) {
          userMessage = 'Invalid OTP. Please check your code and try again.';
        } else if (error.message?.includes('too many')) {
          userMessage = 'Too many attempts. Please wait before trying again.';
        } else if (error.message?.includes('timeout')) {
          userMessage = 'Verification timed out. Please try again.';
        }

        setError(userMessage);
        return { success: false, message: userMessage };
      }

      // Check if user exists and is now confirmed
      if (data?.user) {
        // Set user and session regardless of session presence
        setUser(data.user);
        if (data.session) {
          setSession(data.session);
        }
        setIsEmailVerificationPending(false);

        return { success: true, data: data.user };
      } else {
        return { success: false, message: 'Verification completed but no user data received' };
      }
    } catch (error) {
      setError('Network error occurred');
      return { success: false, message: 'Network error. Please check your connection and try again.' };
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async (email) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });

      if (error) {
        setError(error.message);
        return { success: false, message: error.message };
      }

      return { success: true, message: 'OTP resent successfully!' };
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });

      if (error) {
        setError(error.message);
        return { success: false, message: error.message };
      }

      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const checkOnboardingStatus = async (userId) => {
    try {
      // First check if onboarding was already completed in auth metadata
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser?.user_metadata?.onboarding_completed === true) {
        return { needsOnboarding: false, userData: null };
      }

      // Then check database record as backup
      const { data, error } = await supabase
        .from('users')
        .select('skills_offered, name')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      // User needs onboarding if:
      // 1. No database record exists, OR
      // 2. No skills_offered array, OR  
      // 3. skills_offered array is empty, OR
      // 4. No name
      const needsOnboarding = !data ||
        !data.skills_offered ||
        data.skills_offered.length === 0 ||
        !data.name;

      return { needsOnboarding, userData: data };
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return { needsOnboarding: true, userData: null };
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    isEmailVerificationPending,
    signUp,
    signIn,
    signOut,
    verifyOTP,
    resendOTP,
    updateProfile,
    checkOnboardingStatus,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};