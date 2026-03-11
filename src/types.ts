export type UserRole = 'Sniper' | 'Medic' | 'Assault' | 'Scout' | 'Driver' | 'Base Builder' | 'Looter' | 'Commander';

export interface UserProfile {
  uid: string;
  displayName: string;
  role: UserRole;
  email: string;
  photoURL: string;
  isAdmin: boolean;
  createdAt: number;
}

export interface MapPoint {
  lat: number;
  lng: number;
  label?: string;
}

export interface MapRoute {
  id: string;
  points: { lat: number; lng: number }[];
  color: string;
}

export interface RaidEvent {
  id: string;
  title: string;
  date: number;
  description: string;
  createdBy: string;
  hasMap: boolean;
  mapCenter: [number, number];
  mapZoom: number;
  mapMarkers: MapPoint[];
  mapRoutes: MapRoute[];
  participants: Record<string, 'confirmed' | 'cancelled'>;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  createdAt: number;
}
