import { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { AuthContextType, AuthState, User } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'auth_token';

const getInitialState = (): AuthState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const user: User = JSON.parse(stored);
    return {
      user,
      isAuthenticated: true,
      isLoading: false,
    };
  }
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(getInitialState());

  const login = async (data:User) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const user: User = {
        email:data.email,
        role: data.role.toLowerCase() as 'user' | 'admin',
        accessToken:data.accessToken,
        refreshToken:data.refreshToken,
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      toast.success('Successfully logged in!');
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      toast.error('Failed to login. Please try again.');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}