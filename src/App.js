import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
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
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
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
      </Routes>
    </Router>
  );
}

