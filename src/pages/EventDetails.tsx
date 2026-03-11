import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { RaidEvent, ChatMessage, MapPoint, MapRoute } from '../types';
import { format } from 'date-fns';
import { Calendar, Users, Map as MapIcon, Send, ArrowLeft, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';
import TacticalMap from '../components/TacticalMap';

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<RaidEvent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [isDrawingRoute, setIsDrawingRoute] = useState(false);
  const [currentRoutePoints, setCurrentRoutePoints] = useState<{ lat: number; lng: number }[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;

    const eventRef = doc(db, 'events', id);
    const unsubscribeEvent = onSnapshot(eventRef, (docSnap) => {
      if (docSnap.exists()) {
        setEvent({ id: docSnap.id, ...docSnap.data() } as RaidEvent);
      } else {
        navigate('/');
      }
      setLoading(false);
    });

    const messagesRef = collection(db, 'events', id, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as ChatMessage[];
      setMessages(msgs);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => {
      unsubscribeEvent();
      unsubscribeMessages();
    };
  }, [id, navigate]);

  const handleParticipation = async (status: 'confirmed' | 'cancelled') => {
    if (!event || !userProfile || !id) return;
    
    const updatedParticipants = {
      ...event.participants,
      [userProfile.uid]: status
    };
    
    await updateDoc(doc(db, 'events', id), {
      participants: updatedParticipants
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userProfile || !id) return;

    const msgData: Omit<ChatMessage, 'id'> = {
      text: newMessage.trim(),
      userId: userProfile.uid,
      userName: userProfile.displayName,
      userRole: userProfile.role,
      createdAt: Date.now(),
    };

    await addDoc(collection(db, 'events', id, 'messages'), msgData);
    setNewMessage('');
  };

  // Map Admin Controls
  const handleAddMarker = async (point: MapPoint) => {
    if (!event || !userProfile?.isAdmin || !id) return;
    await updateDoc(doc(db, 'events', id), {
      mapMarkers: [...(event.mapMarkers || []), point]
    });
  };

  const handleAddRoutePoint = (point: { lat: number; lng: number }) => {
    setCurrentRoutePoints(prev => [...prev, point]);
  };

  const handleFinishRoute = async () => {
    if (!event || !userProfile?.isAdmin || !id || currentRoutePoints.length < 2) {
      setIsDrawingRoute(false);
      setCurrentRoutePoints([]);
      return;
    }

    const newRoute: MapRoute = {
      id: Date.now().toString(),
      points: currentRoutePoints,
      color: '#ef4444' // Red tactical route
    };

    await updateDoc(doc(db, 'events', id), {
      mapRoutes: [...(event.mapRoutes || []), newRoute]
    });
    
    setIsDrawingRoute(false);
    setCurrentRoutePoints([]);
  };

  if (loading || !event) return <div className="text-center py-12 text-green-500 font-mono">Loading operation data...</div>;

  const myStatus = event.participants?.[userProfile?.uid || ''];
  const confirmedUsers = Object.entries(event.participants || {}).filter(([_, status]) => status === 'confirmed').length;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-zinc-500 hover:text-green-500 font-bold uppercase tracking-wider text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Board
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Map */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stucco.png')]"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-3xl font-black uppercase tracking-widest text-zinc-100">{event.title}</h1>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(event.date, 'MMM dd, yyyy HH:mm')}
                  </span>
                  <span className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
                    Created by Admin
                  </span>
                </div>
              </div>

              <div className="prose prose-invert prose-zinc max-w-none mb-8 font-mono text-sm leading-relaxed border-l-2 border-green-900 pl-4">
                {event.description}
              </div>

              <div className="flex items-center justify-between border-t border-zinc-800 pt-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    {confirmedUsers} Operatives Confirmed
                  </span>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => handleParticipation('confirmed')}
                    className={`flex items-center gap-2 px-4 py-2 rounded font-bold uppercase tracking-wider text-sm transition-colors ${
                      myStatus === 'confirmed' 
                        ? 'bg-green-900/50 text-green-400 border border-green-500' 
                        : 'bg-zinc-800 text-zinc-400 hover:bg-green-900/30 hover:text-green-500 border border-transparent'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Deploy
                  </button>
                  <button
                    onClick={() => handleParticipation('cancelled')}
                    className={`flex items-center gap-2 px-4 py-2 rounded font-bold uppercase tracking-wider text-sm transition-colors ${
                      myStatus === 'cancelled' 
                        ? 'bg-red-900/50 text-red-400 border border-red-500' 
                        : 'bg-zinc-800 text-zinc-400 hover:bg-red-900/30 hover:text-red-500 border border-transparent'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    Stand Down
                  </button>
                </div>
              </div>
            </div>
          </div>

          {event.hasMap && (
            <div className="bg-zinc-900 border border-zinc-800 rounded p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-black uppercase tracking-widest text-zinc-100 flex items-center gap-2">
                  <MapIcon className="w-5 h-5 text-blue-500" />
                  Tactical Map
                </h2>
                
                {userProfile?.isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (isDrawingRoute) handleFinishRoute();
                        else setIsDrawingRoute(true);
                      }}
                      className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors border ${
                        isDrawingRoute 
                          ? 'bg-red-900/50 text-red-400 border-red-500' 
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border-zinc-700'
                      }`}
                    >
                      {isDrawingRoute ? 'Finish Route' : 'Draw Route'}
                    </button>
                  </div>
                )}
              </div>
              
              <TacticalMap 
                center={event.mapCenter as [number, number]}
                zoom={event.mapZoom}
                markers={event.mapMarkers || []}
                routes={[...(event.mapRoutes || []), ...(isDrawingRoute && currentRoutePoints.length > 0 ? [{ id: 'temp', points: currentRoutePoints, color: '#ef4444' }] : [])]}
                isAdmin={!!userProfile?.isAdmin}
                onAddMarker={handleAddMarker}
                onAddRoutePoint={handleAddRoutePoint}
                onFinishRoute={handleFinishRoute}
                isDrawingRoute={isDrawingRoute}
              />
              
              {!userProfile?.isAdmin && (
                <p className="text-xs text-zinc-500 mt-3 uppercase tracking-widest text-center">
                  Map is read-only for standard operatives.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Comms (Chat) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded flex flex-col h-[600px] lg:h-auto">
          <div className="p-4 border-b border-zinc-800 bg-zinc-950/50">
            <h2 className="text-lg font-black uppercase tracking-widest text-zinc-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-green-600" />
              Operation Comms
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-zinc-600 text-sm font-mono italic mt-10">
                Radio silence...
              </div>
            ) : (
              messages.map(msg => {
                const isMe = msg.userId === userProfile?.uid;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className={`text-xs font-bold uppercase tracking-wider ${isMe ? 'text-green-500' : 'text-zinc-400'}`}>
                        {msg.userName}
                      </span>
                      <span className="text-[10px] text-zinc-600 uppercase tracking-widest">
                        [{msg.userRole}]
                      </span>
                    </div>
                    <div className={`px-3 py-2 rounded max-w-[85%] text-sm font-mono ${
                      isMe 
                        ? 'bg-green-900/20 border border-green-900/50 text-green-100' 
                        : 'bg-zinc-800 border border-zinc-700 text-zinc-300'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-zinc-600 mt-1">
                      {format(msg.createdAt, 'HH:mm')}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800 bg-zinc-950/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Transmit message..."
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-green-500 font-mono"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-green-700 hover:bg-green-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-3 py-2 rounded transition-colors flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
