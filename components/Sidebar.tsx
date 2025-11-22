import React from 'react';
import { Role } from '../types';

interface SidebarProps {
  userRole: Role;
  activeView: string;
  onNavigate: (view: string) => void;
}

const commonLinks = [
  { name: 'Dashboard', href: '#', icon: 'home' },
  { name: 'Profile', href: '#', icon: 'user' },
  { name: 'Notifications', href: '#', icon: 'bell' },
];

const taxpayerLinks = [
  { name: 'My Assessments', href: '#', icon: 'clipboard-list' },
  { name: 'File a Return', href: '#', icon: 'document-add' },
  { name: 'My Documents', href: '#', icon: 'upload' },
  { name: 'Payment History', href: '#', icon: 'currency-dollar' },
  { name: 'TCC Request', href: '#', icon: 'document-text' },
];

const officerLinks = [
  { name: 'Review Documents', href: '#', icon: 'document-search' },
  { name: 'Review TCC', href: '#', icon: 'document-check' },
  { name: 'Manage Assessments', href: '#', icon: 'calculator' },
  { name: 'View Taxpayers', href: '#', icon: 'users' },
];

const adminLinks = [
  { name: 'Manage Users', href: '#', icon: 'user-group' },
  { name: 'System Reports', href: '#', icon: 'chart-pie' },
  { name: 'Settings', href: '#', icon: 'cog' },
];

// Simple icon component using SVG paths
const Icon = ({ name }: { name: string }) => {
    const icons: {[key: string]: string} = {
        home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
        user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
        bell: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.341 6 8.384 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
        'clipboard-list': "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
        'document-add': "M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        upload: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
        'currency-dollar': "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01",
        'document-text': "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        'document-search': "M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 10-4.243-4.242 3 3 0 004.243 4.242z",
        'document-check': "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        calculator: "M9 7h6m0 10v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3m0-10V6a2 2 0 012-2h2a2 2 0 012 2v1m-6 10h6",
        users: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.97 5.97 0 0112 13a5.97 5.97 0 013-1.197",
        'user-group': "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
        'chart-pie': "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M13 21.945A9.003 9.003 0 0013 3v9h9a9.003 9.003 0 00-9 9.945z",
        cog: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    }

    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[name] || ''} />
        </svg>
    )
}

const Sidebar: React.FC<SidebarProps> = ({ userRole, activeView, onNavigate }) => {
  let roleLinks = [];
  if (userRole === Role.TAXPAYER) roleLinks = taxpayerLinks;
  else if (userRole === Role.OFFICER) roleLinks = officerLinks;
  else if (userRole === Role.ADMIN) roleLinks = adminLinks;

  const links = [...commonLinks, ...roleLinks];

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-800 text-white flex flex-col hidden md:flex">
      <div className="h-16 flex items-center justify-center text-2xl font-bold border-b border-gray-700">
        TaxSys
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {links.map((link) => (
          <button
            key={link.name}
            onClick={() => onNavigate(link.name)}
            className={`w-full flex items-center px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white text-left ${activeView === link.name ? 'bg-green-700 text-white' : ''}`}
          >
            <Icon name={link.icon} />
            <span className="ml-4">{link.name}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;