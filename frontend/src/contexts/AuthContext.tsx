import { createContext, useContext, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext<{
  user: any;
  login: (email: string, password: string) => void;
  logout: () => void;
  loading: boolean;
  error: string | null;
}>({
  user: null,
  login: () => {},
  logout: () => {},
  loading: false,
  error: null,
});

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.access_token);
      setUser({ email, token: res.data.access_token });
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear all localStorage items related to theme, tenant, and auth
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('theme-') || key === 'tenantId' || key === 'token') {
        localStorage.removeItem(key);
      }
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

