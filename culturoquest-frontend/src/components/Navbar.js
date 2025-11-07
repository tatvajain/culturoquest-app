import React from 'react';
import { Link, NavLink as RouterNavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';
import imageData from '../data/imageData.json';

const CustomNavLink = ({ to, children }) => {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
          isActive ? "text-teal-600" : "text-slate-600 hover:text-teal-500"
        }`
      }
    >
      {children}
    </RouterNavLink>
  );
};

export default function Navbar() {
  const { questPoints, selectedAvatar } = useGame();
  
  const avatarUrl = imageData.avatars.find(a => a.id === selectedAvatar)?.url;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-extrabold gradient-text">CulturoQuest</Link>
        
        <div className="hidden md:flex items-center space-x-4">
          <CustomNavLink to="/">Home</CustomNavLink>
          <CustomNavLink to="/explore">Explore</CustomNavLink> {/* Restored Link */}
          <CustomNavLink to="/quests">Quests</CustomNavLink>
          <CustomNavLink to="/archives">The Archives</CustomNavLink>
          <CustomNavLink to="/achievements">Achievements</CustomNavLink>
          <CustomNavLink to="/store">Store</CustomNavLink>
          <div className="border-l border-slate-300 h-6"></div>
          
          <motion.div 
            key={questPoints}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="flex items-center px-3 py-2 bg-teal-50 rounded-lg border border-teal-200"
          >
            <span className="text-teal-500 mr-2">💎</span>
            <span className="font-bold text-teal-600">{questPoints} QP</span>
          </motion.div>

          <Link to="/profile" title="Go to Profile">
            <motion.img 
              whileHover={{ scale: 1.1 }}
              src={avatarUrl} 
              alt="User Avatar" 
              className="w-12 h-12 rounded-full object-cover border-2 border-slate-300"
              onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/48x48/f87171/ffffff?text=X'; }}
            />
          </Link>
        </div>
      </div>
    </nav>
  );
}

