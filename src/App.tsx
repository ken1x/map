import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import EventDetails from './pages/EventDetails';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-green-500 font-mono">Loading...</div>;
  if (!currentUser) return <Navigate to="/login" />;
  if (!userProfile) return <Navigate to="/setup" />;

  return <>{children}</>;
};

const SetupRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-green-500 font-mono">Loading...</div>;
  if (!currentUser) return <Navigate to="/login" />;
  if (userProfile) return <Navigate to="/" />;

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Router>
      <div className="min-h-screen bg-zinc-950 text-zinc-300 font-mono selection:bg-green-900 selection:text-green-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/setup" element={<SetupRoute><ProfileSetup /></SetupRoute>} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/event/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
