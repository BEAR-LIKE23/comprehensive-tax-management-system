import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-800 hidden md:block">{user.role} Dashboard</h1>
       <div className="md:hidden">
        <h1 className="text-xl font-bold text-gray-800">TaxSys</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right hidden sm:block">
          <p className="font-semibold text-gray-800">{user.name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <img className="w-12 h-12 rounded-full" src={user.avatar_url} alt={user.name} />
        <button
          onClick={onLogout}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          aria-label="Logout"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
