import React from 'react';
import { 
  LayoutDashboard, 
  LifeBuoy, 
  Settings, 
  Users, 
  Zap, 
  BookOpen,
  LogOut
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentUser: User;
  currentView: string;
  onNavigate: (view: string) => void;
  onSwitchRole: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, currentView, onNavigate, onSwitchRole }) => {
  const isAgent = currentUser.role === 'agent';
  
  const merchantLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'university', label: 'University', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const agentLinks = [
    { id: 'agent-workspace', label: 'Workspace', icon: Users },
    { id: 'diagnostics', label: 'Diagnostics', icon: Zap },
    { id: 'kb', label: 'Knowledge Base', icon: BookOpen },
  ];

  const links = isAgent ? agentLinks : merchantLinks;

  return (
    <div className={`h-screen w-64 flex flex-col border-r ${isAgent ? 'bg-slate-900 text-white' : 'bg-white text-gray-800'}`}>
      <div className="p-6 flex items-center space-x-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isAgent ? 'bg-indigo-500' : 'bg-blue-600'}`}>
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight">DynaCare{isAgent ? '+' : ''}</span>
      </div>

      <div className="flex-1 px-4 py-4 space-y-1">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => onNavigate(link.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              currentView === link.id
                ? (isAgent ? 'bg-slate-800 text-indigo-400' : 'bg-blue-50 text-blue-700')
                : (isAgent ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')
            }`}
          >
            <link.icon className="w-5 h-5" />
            <span>{link.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
        <div className="bg-gray-100 dark:bg-slate-800 rounded-lg p-3 mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-1">Signed in as</p>
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                    {currentUser.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{currentUser.name}</p>
                    <p className="text-xs opacity-70 truncate capitalize">{currentUser.role}</p>
                </div>
            </div>
        </div>
        <button 
            onClick={onSwitchRole}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-xs font-medium border rounded-md hover:bg-gray-50 dark:hover:bg-slate-800 transition"
        >
            <LogOut className="w-3 h-3" />
            <span>Switch Role (Demo)</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;