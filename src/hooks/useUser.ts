import { useState, useEffect } from 'react';
import { User } from '../types/user';
import { UserService } from '../services/userService';

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

  const refreshUser = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const freshUserData = await UserService.fetchUserProfile();
      setUser(freshUserData);
      localStorage.setItem('user', JSON.stringify(freshUserData));
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
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
    refreshUser,
    getDisplayName,
    getInitials,
    getEmail,
    getProfilePicture,
  };
};