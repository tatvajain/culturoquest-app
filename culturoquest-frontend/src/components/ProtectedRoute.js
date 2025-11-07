import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 1. Import the REAL useAuth
import Navbar from './Navbar';

export default function ProtectedRoute() {
  // 2. Get the REAL authentication status
  const { isAuthenticated, loading } = useAuth(); 

  // 3. Show a loading spinner while the context is checking the token
  if (loading) {
    return <div className="flex h-screen items-center justify-center"><div className="text-xl font-semibold text-slate-700">Loading...</div></div>; // Or a proper loading spinner component
  }

  // 4. If not logged in, redirect to the /login page
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // 5. If logged in, show the Navbar and the requested page (Outlet)
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}