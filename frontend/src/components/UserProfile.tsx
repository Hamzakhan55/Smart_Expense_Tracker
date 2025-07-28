'use client';

import { useAuth } from '@/context/AuthContext';
import { User, LogOut } from 'lucide-react';

const UserProfile = () => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-2 flex-1">
        <User className="w-5 h-5 text-blue-500" />
        <span className="text-sm font-medium text-gray-700">{user.email}</span>
      </div>
      <button
        onClick={logout}
        className="p-1 text-gray-500 hover:text-red-500 transition-colors"
        title="Logout"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
};

export default UserProfile;