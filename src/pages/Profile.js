import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import imageData from '../data/imageData.json';

// Mock Data for display purposes
const user = { 
  username: "TatvaTheExplorer", 
  title: "Level 5: Scribe", 
  level: 5,
  progress: 60, // 60% to next level
};
const stats = { lifetimeQP: 1250, sagasMastered: 1, accuracy: "92%" };
const badges = [
  { name: "Mauryan Scholar", emoji: "📜" },
  { name: "Timeline Titan", emoji: "⏳" },
  { name: "Quest Novice", emoji: "✨" },
];
const recentActivity = [
  { text: "Unlocked Achievement: Timeline Titan!", time: "2h ago" },
  { text: "Completed Quest: Mauryan Dynasty Timeline", time: "3h ago" },
  { text: "Started Saga: The Mauryan Empire", time: "1d ago" },
];

// Sub-components for the Profile Page
const StatCard = ({ label, value, emoji }) => (
    <motion.div whileHover={{ scale: 1.05 }} className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-slate-200 text-center shadow-sm">
      <p className="text-sm text-slate-500 uppercase tracking-wider">{emoji} {label}</p>
      <p className="text-3xl font-bold text-teal-600">{value}</p>
    </motion.div>
);
  
const Badge = ({ name, emoji }) => (
    <motion.div whileHover={{ scale: 1.1 }} className="text-center p-2">
      <div className="w-20 h-20 mx-auto bg-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-teal-500/20 text-4xl text-white">
        {emoji}
      </div>
      <h4 className="mt-3 font-bold text-slate-800 text-sm">{name}</h4>
    </motion.div>
);
  
const ProgressRing = ({ progress }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;
    
    return (
        <svg className="w-28 h-28" viewBox="0 0 100 100">
            <defs>
                <linearGradient id="ringGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
            </defs>
            <circle className="text-slate-200" strokeWidth="10" stroke="currentColor" fill="transparent" r={radius} cx="50" cy="50" />
            <motion.circle
                className="text-orange-500"
                strokeWidth="10"
                stroke="url(#ringGradient)"
                strokeLinecap="round"
                fill="transparent"
                r={radius}
                cx="50"
                cy="50"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                strokeDasharray={circumference}
            />
            <text x="50" y="55" textAnchor="middle" className="text-2xl font-bold fill-current text-slate-700">{user.level}</text>
        </svg>
    );
};

const AvatarSelectionModal = ({ onClose }) => {
    const { setAvatar } = useGame();
    
    const handleSelect = (avatarId) => {
        setAvatar(avatarId);
        onClose();
    };
    
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">Choose Your Avatar</h2>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {imageData.avatars.map(avatar => (
                        <motion.div 
                            key={avatar.id}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleSelect(avatar.id)}
                            className="cursor-pointer"
                        >
                            <img src={avatar.url} alt={avatar.name} className="w-24 h-24 rounded-full object-cover border-4 border-slate-200 hover:border-teal-500 transition-colors" />
                            <p className="text-center text-sm font-semibold text-slate-600 mt-2">{avatar.name}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

// Main Profile Page Component
export default function Profile() {
  const { selectedAvatar } = useGame();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const avatarUrl = imageData.avatars.find(a => a.id === selectedAvatar)?.url;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          className="lg:col-span-1 bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 shadow-lg text-center flex flex-col"
        >
          <div className="relative w-32 h-32 mx-auto">
            <ProgressRing progress={user.progress} />
            <div className="absolute inset-0 p-2">
                <img 
                    src={avatarUrl} 
                    alt="Selected Avatar" 
                    className="w-full h-full rounded-full object-cover shadow-inner"
                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/112x112/f87171/ffffff?text=X'; }}
                />
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-4 text-sm font-semibold text-teal-600 hover:underline"
          >
            Change Avatar
          </button>
          <h2 className="text-3xl font-extrabold gradient-text mt-2">@{user.username}</h2>
          <p className="mt-1 text-md font-semibold text-slate-600">{user.title}</p>
          <div className="mt-6 grid grid-cols-3 gap-4">
            {badges.map((b) => <Badge key={b.name} {...b} />)}
          </div>
          <div className="mt-auto pt-6">
            <button 
                onClick={handleLogout}
                className="w-full px-6 py-3 rounded-full bg-red-500 text-white font-bold transition-colors hover:bg-red-600"
            >
                Logout
            </button>
          </div>
        </motion.div>

        <div className="lg:col-span-2 space-y-8">
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Your Stats</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard label="Lifetime QP" value={stats.lifetimeQP.toLocaleString()} emoji="💎" />
                  <StatCard label="Sagas Mastered" value={stats.sagasMastered} emoji="📚" />
                  <StatCard label="Accuracy" value={stats.accuracy} emoji="🎯" />
              </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                  {recentActivity.map((activity, i) => (
                      <div key={i} className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                          <p className="text-slate-700">{activity.text}</p>
                          <p className="text-slate-400 text-sm flex-shrink-0 ml-4">{activity.time}</p>
                      </div>
                  ))}
              </div>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {isModalOpen && <AvatarSelectionModal onClose={() => setIsModalOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

