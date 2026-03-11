import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { RaidEvent } from '../types';
import { format } from 'date-fns';
import { Calendar, Map as MapIcon, Users, Plus, X } from 'lucide-react';

export default function Dashboard() {
  const { userProfile } = useAuth();
  const [events, setEvents] = useState<RaidEvent[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventHasMap, setNewEventHasMap] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RaidEvent[];
      
      // Filter out past events (older than 24 hours)
      const now = Date.now();
      const upcoming = eventsData.filter(e => e.date > now - 86400000);
      setEvents(upcoming);
    });

    return unsubscribe;
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.isAdmin) return;

    try {
      const eventData: Omit<RaidEvent, 'id'> = {
        title: newEventTitle,
        date: new Date(newEventDate).getTime(),
        description: newEventDesc,
        createdBy: userProfile.uid,
        hasMap: newEventHasMap,
        mapCenter: [50, 50], // Default center for L.CRS.Simple image map
        mapZoom: 3,
        mapMarkers: [],
        mapRoutes: [],
        participants: {},
        createdAt: Date.now(),
      };

      await addDoc(collection(db, 'events'), eventData);
      setShowCreateModal(false);
      setNewEventTitle('');
      setNewEventDate('');
      setNewEventDesc('');
      setNewEventHasMap(false);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-zinc-100">Operation Board</h1>
          <p className="text-zinc-500 font-medium text-sm mt-1 uppercase tracking-wider">Upcoming Raids & Operations</p>
        </div>
        
        {userProfile?.isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded font-bold uppercase tracking-wider text-sm flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Plan Operation
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full text-center py-12 text-zinc-600 border border-zinc-800 border-dashed rounded bg-zinc-900/50">
            <p className="uppercase tracking-widest font-bold">No upcoming operations scheduled.</p>
            <p className="text-sm mt-2">Stand by for orders.</p>
          </div>
        ) : (
          events.map(event => {
            const confirmedCount = Object.values(event.participants || {}).filter(status => status === 'confirmed').length;
            const isParticipating = event.participants?.[userProfile?.uid || ''] === 'confirmed';

            return (
              <Link
                key={event.id}
                to={`/event/${event.id}`}
                className="group bg-zinc-900 border border-zinc-800 hover:border-green-600/50 rounded overflow-hidden transition-all hover:shadow-[0_0_15px_rgba(34,197,94,0.1)] relative"
              >
                {/* Grunge texture */}
                <div className="absolute inset-0 opacity-5 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stucco.png')]"></div>
                
                <div className="p-5 relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-black uppercase tracking-wider text-zinc-100 group-hover:text-green-400 transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                    {isParticipating && (
                      <span className="bg-green-900/30 text-green-500 text-[10px] uppercase font-bold px-2 py-1 rounded border border-green-900/50 whitespace-nowrap ml-2">
                        Deployed
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-3 text-sm text-zinc-400 font-medium">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-zinc-500" />
                      <span>{format(event.date, 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-zinc-500" />
                      <span>{confirmedCount} Operatives Confirmed</span>
                    </div>
                    
                    {event.hasMap && (
                      <div className="flex items-center gap-3 text-blue-400/80">
                        <MapIcon className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider">Tactical Map Available</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-zinc-950 px-5 py-3 border-t border-zinc-800 text-xs text-zinc-500 uppercase tracking-widest flex justify-between items-center relative z-10">
                  <span>View Details</span>
                  <span className="text-green-600 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && userProfile?.isAdmin && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-sm w-full max-w-lg shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stucco.png')]"></div>
            
            <div className="p-6 relative z-10">
              <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                <h2 className="text-xl font-black uppercase tracking-widest text-zinc-100">Plan New Operation</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-zinc-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateEvent} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Operation Name</label>
                  <input
                    type="text"
                    required
                    value={newEventTitle}
                    onChange={e => setNewEventTitle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-green-500 font-mono"
                    placeholder="e.g. NWAF Raid"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEventDate}
                    onChange={e => setNewEventDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-green-500 font-mono [color-scheme:dark]"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Briefing / Description</label>
                  <textarea
                    required
                    value={newEventDesc}
                    onChange={e => setNewEventDesc(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-green-500 font-mono h-24 resize-none"
                    placeholder="Mission objectives, gear requirements..."
                  />
                </div>
                
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="hasMap"
                    checked={newEventHasMap}
                    onChange={e => setNewEventHasMap(e.target.checked)}
                    className="w-4 h-4 bg-zinc-950 border-zinc-700 rounded text-green-600 focus:ring-green-500 focus:ring-offset-zinc-900"
                  />
                  <label htmlFor="hasMap" className="text-sm font-bold text-zinc-300 uppercase tracking-wider cursor-pointer">
                    Include Tactical Map (Chernarus)
                  </label>
                </div>
                
                <div className="pt-6 flex justify-end gap-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-zinc-400 hover:text-white font-bold uppercase tracking-wider text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-700 hover:bg-green-600 text-white px-6 py-2 rounded font-bold uppercase tracking-wider text-sm transition-colors"
                  >
                    Deploy Operation
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
