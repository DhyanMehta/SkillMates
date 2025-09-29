import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Get user profile from database
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setUser({
            id: session.user.id,
            email: session.user.email,
            name: profile?.name || session.user.email?.split('@')[0] || 'User',
            ...profile
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            // Get user profile from database
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            setUser({
              id: session.user.id,
              email: session.user.email,
              name: profile?.name || session.user.email?.split('@')[0] || 'User',
              ...profile
            });
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email, password, userData) => {
    console.log('SignUp called with:', { email, userData });

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData?.name || email.split("@")[0],
          }
        }
      });

      if (error) {
        setError(error.message);
        return { success: false, message: error.message };
      }

      // The user profile will be created automatically by the database trigger
      return { success: true, data: data.user };
    } catch (error) {
      console.error('Error signing up:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    console.log('SignIn called with:', { email });

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

      return { success: true, data: data.user };
    } catch (error) {
      console.error('Error signing in:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('SignOut called');

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        return { success: false, message: error.message };
      }
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, message: error.message };
    }
  };

  const resetPassword = async (email) => {
    console.log('ResetPassword called with:', { email });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Password reset email sent!' };
    } catch (error) {
      console.error('Error sending reset email:', error);
      return { success: false, message: error.message };
    }
  };

  const updatePassword = async (newPassword) => {
    console.log('UpdatePassword called');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Password updated successfully!' };
    } catch (error) {
      console.error('Error updating password:', error);
      return { success: false, message: error.message };
    }
  };

  const verifyOTP = async (email, token) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });

      if (error) {
        setError(error.message);
        return { success: false, message: error.message };
      }

      return { success: true, data: data.user };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError(error.message);
      return { success: false, message: error.message };
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
      console.error('Error resending OTP:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    verifyOTP,
    resendOTP,
    loading,
    error
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

export default AuthContext;