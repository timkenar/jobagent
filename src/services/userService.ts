import { API_ENDPOINTS, apiCall } from '../config/api';
import { User } from '../types/user';

export class UserService {
  static async fetchUserProfile(): Promise<User> {
    try {
      const response = await apiCall(API_ENDPOINTS.USER.PROFILE);
      
      // Backend returns { success: true, user: userData }
      if (response.success && response.user) {
        return response.user;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  }

  static async updateUserProfile(profileData: Partial<User>): Promise<User> {
    try {
      const response = await apiCall(API_ENDPOINTS.USER.UPDATE_PROFILE, {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      
      // Backend returns { success: true, user: userData }
      if (response.success && response.user) {
        return response.user;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Failed to update user profile:', error);
      // If PUT method doesn't exist yet, throw a more specific error
      if (error.message?.includes('405') || error.message?.includes('Method Not Allowed')) {
        throw new Error('Profile update not yet implemented on backend');
      }
      throw error;
    }
  }

  static async updateUserPreferences(preferences: any): Promise<any> {
    try {
      const response = await apiCall(API_ENDPOINTS.USER.PREFERENCES, {
        method: 'PUT',
        body: JSON.stringify(preferences),
      });
      return response;
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      throw error;
    }
  }

  static async getUserPreferences(): Promise<any> {
    try {
      const response = await apiCall(API_ENDPOINTS.USER.PREFERENCES);
      return response;
    } catch (error) {
      console.error('Failed to fetch user preferences:', error);
      throw error;
    }
  }
}