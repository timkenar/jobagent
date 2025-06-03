import React from 'react';

interface User {
  id: string;
  email: string;
  fullName: string;
  profile_picture?: string;
}

const UserProfile: React.FC = () => {
  const userJson = localStorage.getItem('user');
  const user: User | null = userJson ? JSON.parse(userJson) : null;

  if (!user) {
    return null; // Don't render if no user is logged in
  }

  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-md">
      {user.profile_picture && (
        <img
          src={user.profile_picture}
          alt={user.fullName}
          className="w-12 h-12 rounded-full object-cover"
        />
      )}
      <div>
        <p className="text-lg font-semibold text-slate-800">{user.fullName || 'User'}</p>
        <p className="text-sm text-slate-600">{user.email}</p>
      </div>
    </div>
  );
};

export default UserProfile;