import { useState, useEffect } from 'react';
import { User } from '../types/user';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          // Handle both new and legacy user formats
          if (parsedUser.full_name || parsedUser.fullName) {
            setUser(parsedUser);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        loadUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Helper functions for backward compatibility
  const getDisplayName = () => {
    if (!user) return 'User';
    return user.full_name || (user as any).fullName || 'User';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name[0]?.toUpperCase() || 'U';
  };

  const getEmail = () => {
    return user?.email || '';
  };

  const getProfilePicture = () => {
    return user?.profile_picture;
  };

  return {
    user,
    loading,
    updateUser,
    getDisplayName,
    getInitials,
    getEmail,
    getProfilePicture,
  };
};