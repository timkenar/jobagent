import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types/user';
import { UserService } from '../services/userService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  updateUser: (userData: User) => void;
  refreshUser: () => Promise<void>;
  handleLoginSuccess: (token: string) => Promise<void>;
  signOut: () => void;
  getDisplayName: () => string;
  getInitials: () => string;
  getEmail: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserFromStorage = () => {
    try {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('authToken');
      
      if (userData && token) {
        const parsedUser = JSON.parse(userData);
        
        // Ensure the user object has all required fields
        if (parsedUser && (parsedUser.email || parsedUser.full_name || parsedUser.id)) {
          setUser(parsedUser);
          return parsedUser;
        }
      }
    } catch (error) {
      console.error('Error loading user data from storage:', error);
      // Clear corrupted data
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
    }
    return null;
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const freshUserData = await UserService.fetchUserProfile();
      setUser(freshUserData);
      localStorage.setItem('user', JSON.stringify(freshUserData));
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // Fall back to stored data if API fails
      const storedUser = loadUserFromStorage();
      if (!storedUser) {
        // If no stored data and API fails, user might need to re-authenticate
        localStorage.removeItem('authToken');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        // Clear any stale cached user data to force fresh API fetch
        localStorage.removeItem('user');
        setUser(null);
        
        // If we have a token, ALWAYS fetch from API first
        try {
          console.log('AuthContext: Token found, fetching fresh data from API...');
          await refreshUser();
        } catch (error) {
          console.error('AuthContext: API fetch failed:', error);
          // If API fails, the token might be invalid - clear it
          localStorage.removeItem('authToken');
          setUser(null);
          setLoading(false);
        }
      } else {
        // No token - clear any cached user data and start fresh
        localStorage.removeItem('user');
        setUser(null);
        setLoading(false);
      }
    };

    initializeUser().catch(console.error);

    // Listen for storage changes (e.g., from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        if (e.newValue) {
          // New token added - fetch fresh data
          refreshUser();
        } else {
          // Token removed - clear user
          setUser(null);
        }
      }
    };

    // Listen for custom login event
    const handleUserLoggedIn = (e: CustomEvent) => {
      const { token } = e.detail;
      console.log('AuthContext: Received userLoggedIn event, fetching profile...');
      handleLoginSuccess(token);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLoggedIn', handleUserLoggedIn as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedIn', handleUserLoggedIn as EventListener);
    };
  }, []);

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLoginSuccess = async (token: string) => {
    console.log('AuthContext: Handling login success, fetching user profile...');
    localStorage.setItem('authToken', token);
    try {
      await refreshUser();
      console.log('AuthContext: Profile loaded successfully after login');
    } catch (error) {
      console.error('AuthContext: Failed to load profile after login:', error);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userStats');
    // Optionally call backend logout endpoint
  };

  const getDisplayName = () => {
    if (!user) return 'User';
    return user.full_name || (user as any).fullName || 'User';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]?.toUpperCase()).join('').slice(0, 2) || 'U';
  };

  const getEmail = () => {
    return user?.email || '';
  };

  const isAuthenticated = !!user && !!localStorage.getItem('authToken');

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    updateUser,
    refreshUser,
    handleLoginSuccess,
    signOut,
    getDisplayName,
    getInitials,
    getEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};