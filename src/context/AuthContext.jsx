import { createContext, useContext, useEffect, useState } from "react";
// Backend removed: using local-only auth state

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('local_user');
    if (raw) setUser(JSON.parse(raw));
    setLoading(false);
  }, []);

  const signUp = async (email, _password, userData) => {
    const newUser = {
      id: crypto.randomUUID(),
      name: userData?.name || email.split("@")[0],
      email,
    };
    // Register without logging in
    localStorage.setItem('local_user', JSON.stringify(newUser));
    return { success: true, data: newUser };
  };

  const signIn = async (email, _password) => {
    const raw = localStorage.getItem('local_user');
    const existing = raw ? JSON.parse(raw) : null;
    if (existing && String(existing.email || '').toLowerCase() === String(email || '').toLowerCase()) {
      setUser(existing);
      return { success: true, data: existing };
    }
    return { success: false, message: 'Account not found. Please sign up.' };
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('local_user');
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, message: 'Error signing out' };
    }
  };

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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