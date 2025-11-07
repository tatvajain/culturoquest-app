import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar"; // Ensure Navbar is imported if you want it on some pages, though ProtectedRoute handles it usually.
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Quests from "./pages/Quests";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Register from "./pages/Register";
import Login from "./pages/login";
import Achievements from "./pages/Achievements";
import Archives from "./pages/Archives";
import Store from "./pages/Store";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- Protected Routes (Require Login) --- */}
        {/* If not logged in, these will automatically redirect to /login */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/archives" element={<Archives />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/store" element={<Store />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* --- CATCH-ALL ROUTE --- */}
        {/* Any URL that doesn't match above will redirect to /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}