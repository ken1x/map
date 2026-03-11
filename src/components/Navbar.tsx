import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { LogOut, ShieldAlert, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!currentUser || !userProfile) return null;

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-green-500 font-bold text-xl tracking-widest uppercase">
          <ShieldAlert className="w-6 h-6" />
          <span>DayZ Raid Planner</span>
        </Link>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-zinc-950 px-3 py-1.5 rounded-md border border-zinc-800">
            <img 
              src={userProfile.photoURL || 'https://picsum.photos/seed/dayz/200'} 
              alt="Profile" 
              className="w-8 h-8 rounded-sm object-cover grayscale"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-zinc-100 leading-none">{userProfile.displayName}</span>
              <span className="text-xs text-green-600 font-semibold uppercase tracking-wider">{userProfile.role}</span>
            </div>
            {userProfile.isAdmin && (
              <span className="ml-2 px-1.5 py-0.5 bg-red-900/50 text-red-400 text-[10px] uppercase font-bold rounded border border-red-900">Admin</span>
            )}
          </div>
          
          <button 
            onClick={handleLogout}
            className="text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-2 text-sm uppercase tracking-wider font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
