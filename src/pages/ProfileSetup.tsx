import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { UserRole } from '../types';
import { Crosshair, HeartPulse, Shield, Binoculars, Truck, Hammer, Backpack, Star } from 'lucide-react';

const ROLES: { name: UserRole; icon: React.ReactNode; desc: string }[] = [
  { name: 'Sniper', icon: <Crosshair className="w-5 h-5" />, desc: 'Long-range support and overwatch' },
  { name: 'Medic', icon: <HeartPulse className="w-5 h-5" />, desc: 'Healing and revives' },
  { name: 'Assault', icon: <Shield className="w-5 h-5" />, desc: 'Frontline combat and breaching' },
  { name: 'Scout', icon: <Binoculars className="w-5 h-5" />, desc: 'Reconnaissance and intel' },
  { name: 'Driver', icon: <Truck className="w-5 h-5" />, desc: 'Vehicle operation and logistics' },
  { name: 'Base Builder', icon: <Hammer className="w-5 h-5" />, desc: 'Fortification and defense' },
  { name: 'Looter', icon: <Backpack className="w-5 h-5" />, desc: 'Resource gathering' },
  { name: 'Commander', icon: <Star className="w-5 h-5" />, desc: 'Tactical leadership' },
];

export default function ProfileSetup() {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !role) return;

    setLoading(true);
    try {
      await updateProfile(displayName.trim(), role);
      navigate('/');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12">
      <div className="bg-zinc-900 border border-zinc-700 p-8 rounded-sm shadow-2xl relative overflow-hidden">
        {/* Grunge overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stucco.png')]"></div>

        <h2 className="text-2xl font-black uppercase tracking-widest text-zinc-100 mb-6 border-b border-zinc-800 pb-4">
          Operative Registration
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div>
            <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Callsign / Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded px-4 py-3 text-zinc-100 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors font-mono"
              placeholder="Enter your callsign..."
              required
              maxLength={30}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">
              Primary Role Specialization
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROLES.map((r) => (
                <button
                  key={r.name}
                  type="button"
                  onClick={() => setRole(r.name)}
                  className={`flex items-start gap-3 p-4 rounded border text-left transition-all ${
                    role === r.name
                      ? 'bg-green-900/20 border-green-500 text-green-400'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  <div className={`mt-0.5 ${role === r.name ? 'text-green-500' : 'text-zinc-600'}`}>
                    {r.icon}
                  </div>
                  <div>
                    <div className="font-bold uppercase tracking-wider text-sm">{r.name}</div>
                    <div className="text-xs opacity-70 mt-1">{r.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!displayName.trim() || !role || loading}
            className="w-full bg-green-700 hover:bg-green-600 text-white font-black uppercase tracking-widest py-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}
