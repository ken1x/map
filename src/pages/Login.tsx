import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function Login() {
  const { loginWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-lg shadow-2xl relative overflow-hidden">
        {/* Grunge overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/worn-dots.png')]"></div>
        
        <div className="flex flex-col items-center text-center mb-8 relative z-10">
          <ShieldAlert className="w-16 h-16 text-green-600 mb-4" />
          <h1 className="text-3xl font-black uppercase tracking-widest text-zinc-100 mb-2">DayZ Raid Planner</h1>
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Secure Access Required</p>
        </div>

        <div className="space-y-4 relative z-10">
          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-zinc-100 text-zinc-900 hover:bg-white py-3 px-4 rounded-md font-bold uppercase tracking-wider transition-all duration-200 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Authenticate with Google
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-zinc-800 text-center relative z-10">
          <p className="text-xs text-zinc-600 uppercase tracking-widest">Authorized personnel only. Violators will be shot.</p>
        </div>
      </div>
    </div>
  );
}
