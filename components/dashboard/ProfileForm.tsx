import React, { useState } from 'react';
import { ProfileFormProps, ProfileFormData } from './types';
import { useAuth } from '../../src/contexts/AuthContext';
import { UserService } from '../../src/services/userService';
import ProfileDataSummary from './ProfileDataSummary';
import LogoSpinner from '../ui/logospinner';

const ProfileForm: React.FC<ProfileFormProps> = ({ userProfile, onComplete, onCancel }) => {
  const { user, updateUser } = useAuth();
  
  // Pre-populate form with user data from AuthContext or passed userProfile
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: user?.full_name || userProfile?.full_name || '',
    email: user?.email || userProfile?.email || '',
    phone_number: user?.phone_number || userProfile?.phone_number || '',
    skills: userProfile?.skills || '',
    experience_years: userProfile?.experience_years || '',
    job_category: userProfile?.job_category || '',
    preferred_locations: userProfile?.preferred_locations || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');
      if (token && user) {
        // Use the UserService to update profile via API
        const profileData = {
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          // Additional profile fields can be added here as needed
        };

        try {
          const updatedUser = await UserService.updateUserProfile(profileData);
          // Update user in AuthContext with the response from backend
          updateUser(updatedUser);
        } catch (apiError) {
          console.warn('API update failed, falling back to local update:', apiError);
          // Fallback to local update if API fails
          const updatedUser = { 
            ...user, 
            ...formData,
            // Keep important backend fields intact
            id: user.id,
            signup_method: user.signup_method,
            signup_method_display: user.signup_method_display,
            profile_completion_percentage: user.profile_completion_percentage,
            is_email_verified: user.is_email_verified,
            registration_date: user.registration_date
          };
          updateUser(updatedUser);
        }
        
        // Also save to userProfile for backward compatibility
        localStorage.setItem('userProfile', JSON.stringify(formData));
        
        onComplete(formData);
      } else {
        // Fallback for legacy users without enhanced data
        const updatedUser = { ...userProfile, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        localStorage.setItem('userProfile', JSON.stringify(formData));
        onComplete(formData);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 max-w-3xl mx-auto border border-gray-100">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h3>
        <p className="text-gray-600">
          {user ? 'Update your profile information and add additional details' : 'Help us personalize your job search experience'}
        </p>
        {user && user.profile_completion_percentage !== undefined && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Profile Completion</span>
              <span className="text-sm font-bold text-blue-600">{user.profile_completion_percentage}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${user.profile_completion_percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      {user && (
        <div className="mb-6">
          <ProfileDataSummary showDetails={false} />
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center">
              Full Name *
              {user?.full_name && (
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  ✓ From Account
                </span>
              )}
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                user?.full_name 
                  ? 'border-green-200 bg-green-50 focus:bg-white' 
                  : 'border-gray-200 bg-gray-50 focus:bg-white'
              }`}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center">
              Email *
              {user?.email && (
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  ✓ From Account
                </span>
              )}
              {user?.is_email_verified && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  Verified
                </span>
              )}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                user?.email 
                  ? 'border-green-200 bg-green-50 focus:bg-white' 
                  : 'border-gray-200 bg-gray-50 focus:bg-white'
              }`}
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            Phone Number
            {user?.phone_number && (
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                ✓ From Account
              </span>
            )}
          </label>
          <input
            type="tel"
            value={formData.phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              user?.phone_number 
                ? 'border-green-200 bg-green-50 focus:bg-white' 
                : 'border-gray-300 bg-white'
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Category
          </label>
          <input
            type="text"
            value={formData.job_category}
            onChange={(e) => setFormData({ ...formData, job_category: e.target.value })}
            placeholder="e.g., Software Engineer, Data Scientist"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Years of Experience
          </label>
          <select
            value={formData.experience_years}
            onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select experience level</option>
            <option value="0-1">0-1 years (Entry level)</option>
            <option value="2-3">2-3 years (Junior)</option>
            <option value="4-6">4-6 years (Mid-level)</option>
            <option value="7-10">7-10 years (Senior)</option>
            <option value="10+">10+ years (Expert)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Skills (comma-separated)
          </label>
          <textarea
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            placeholder="e.g., React, Node.js, Python, SQL"
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preferred Locations
          </label>
          <input
            type="text"
            value={formData.preferred_locations}
            onChange={(e) => setFormData({ ...formData, preferred_locations: e.target.value })}
            placeholder="e.g., Remote, New York, San Francisco"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-8">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 px-6 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.full_name || !formData.email}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <LogoSpinner size={20} inline />
                <span className="ml-2">Saving...</span>
              </div>
            ) : (
              'Save Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;