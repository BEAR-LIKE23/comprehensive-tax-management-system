
import React from 'react';

interface LoginSelectorProps {
  onSelect: (type: 'user' | 'admin') => void;
}

const PortalCard: React.FC<{ title: string, description: string, icon: React.ReactNode, onClick: () => void }> = ({ title, description, icon, onClick }) => (
    <button onClick={onClick} className="w-full md:w-80 p-8 text-center bg-white rounded-lg shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300">
        <div className="flex justify-center items-center h-20 w-20 mx-auto bg-green-100 rounded-full">
            {icon}
        </div>
        <h2 className="mt-6 text-2xl font-bold text-gray-800">{title}</h2>
        <p className="mt-2 text-gray-600">{description}</p>
    </button>
);

const LoginSelector: React.FC<LoginSelectorProps> = ({ onSelect }) => {
  return (
    <div className="w-full max-w-4xl p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800">Tax Management System</h1>
        <p className="mt-2 text-xl text-gray-600">Please select your portal to continue.</p>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-center gap-10 pt-8">
        <PortalCard 
            title="Taxpayer & Officer Portal"
            description="Access your dashboard, file returns, make payments, and manage documents."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.97 5.97 0 0112 13a5.97 5.97 0 013-1.197" /></svg>}
            onClick={() => onSelect('user')}
        />
        <PortalCard 
            title="Administrator Portal"
            description="Manage system settings, users, and generate comprehensive reports."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            onClick={() => onSelect('admin')}
        />
      </div>
    </div>
  );
};

export default LoginSelector;
