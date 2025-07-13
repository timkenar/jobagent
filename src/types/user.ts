export interface User {
  id: number;
  email: string;
  full_name: string;
  signup_method: 'email' | 'google';
  signup_method_display: string;
  profile_completion_percentage: number;
  is_email_verified: boolean;
  phone_number?: string;
  profile_picture?: string;
  registration_date: string;
}

// For backward compatibility
export interface LegacyUser {
  id: string;
  email: string;
  fullName: string;
  profile_picture?: string;
}

export const convertToLegacyUser = (user: User): LegacyUser => ({
  id: user.id.toString(),
  email: user.email,
  fullName: user.full_name,
  profile_picture: user.profile_picture,
});

export const getProfileCompletionItems = (user: User) => {
  const items = [
    { name: 'Email', completed: !!user.email, required: true },
    { name: 'Full Name', completed: !!user.full_name, required: true },
    { name: 'Email Verification', completed: user.is_email_verified, required: true },
    { name: 'Phone Number', completed: !!user.phone_number, required: false },
    { name: 'Profile Picture', completed: !!user.profile_picture, required: false },
  ];

  const completedRequired = items.filter(item => item.required && item.completed).length;
  const totalRequired = items.filter(item => item.required).length;
  const completedOptional = items.filter(item => !item.required && item.completed).length;
  const totalOptional = items.filter(item => !item.required).length;

  return {
    items,
    completedRequired,
    totalRequired,
    completedOptional,
    totalOptional,
    overall: Math.round(((completedRequired + completedOptional) / items.length) * 100),
  };
};