import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import { GameProvider } from '../context/GameContext'; // We already have the import

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // We are moving GameProvider to wrap the ENTIRE layout.
  // Now, both Navbar and Outlet are inside the "Wi-Fi zone".
  return (
    <GameProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow w-full max-w-7xl mx-auto p-6 md-p-8">
          <Outlet />
        </main>
        <footer className="text-center text-sm text-slate-500 py-6">
          © {new Date().getFullYear()} CulturoQuest — Where Learning Meets Legacy
        </footer>
      </div>
    </GameProvider>
  );
}