import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext'; // Gets game data
import { useAuth } from '../context/AuthContext';   // Gets auth data
import { useNavigate } from 'react-router-dom';
import imageData from '../data/imageData.json';
import storeData from '../data/storeItems.json';

// --- NO API_URL HERE! ---

// --- HELPER: Calculate Level ---
const calculateLevelInfo = (qp) => {
    const level = Math.floor(qp / 1000) + 1;
    const progress = ((qp % 1000) / 1000) * 100;
    let title = "Novice Explorer";
    if (level >= 2) title = "Apprentice Scribe";
    if (level >= 3) title = "Journeyman Scholar";
    if (level >= 5) title = "Master Historian";
    if (level >= 10) title = "Time Lord";
    return { level, title, progress };
};

// --- SUB-COMPONENTS ---
// (StatCard, InventoryItem, ProgressRing, AvatarSelectionModal... keep them exactly as they were)
const StatCard = ({ label, value, emoji }) => (
    <motion.div whileHover={{ scale: 1.05 }} className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-indigo-100 text-center shadow-sm">
      <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">{emoji} {label}</p>
      <p className="text-3xl font-black text-indigo-900">{value}</p>
    </motion.div>
);

const InventoryItem = ({ item }) => {
    const [revealed, setRevealed] = useState(false);
    const copyCode = () => {
        navigator.clipboard.writeText(item.couponCode);
        setRevealed(true);
        setTimeout(() => setRevealed(false), 2000);
    };
    return (
        <motion.div layout onClick={copyCode} className="bg-white p-4 rounded-xl border-2 border-slate-200 cursor-pointer hover:border-indigo-400 transition-all group relative overflow-hidden">
            <div className="flex items-center space-x-3">
                <div className="text-2xl">{item.logo_placeholder}</div>
                <div>
                    <h4 className="font-bold text-slate-800 leading-tight">{item.brandName}</h4>
                    <p className="text-sm font-medium text-indigo-600">{item.offer}</p>
                </div>
            </div>
            <div className={`mt-3 py-2 px-3 rounded-lg text-center font-mono font-bold text-sm transition-colors ${revealed ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                {revealed ? 'COPIED! ✅' : item.couponCode}
            </div>
        </motion.div>
    );
};

const ProgressRing = ({ progress, level }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;
    return (
        <svg className="w-32 h-32" viewBox="0 0 100 100">
            <defs><linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#ec4899" /></linearGradient></defs>
            <circle className="text-indigo-100" strokeWidth="8" stroke="currentColor" fill="transparent" r={radius} cx="50" cy="50" />
            <motion.circle className="text-indigo-500" strokeWidth="8" stroke="url(#ringGradient)" strokeLinecap="round" fill="transparent" r={radius} cx="50" cy="50"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.5, ease: "easeInOut" }} strokeDasharray={circumference}
            />
            <text x="50" y="58" textAnchor="middle" className="text-3xl font-black fill-indigo-900">{level}</text>
        </svg>
    );
};

const AvatarSelectionModal = ({ onClose }) => {
    const { setAvatar } = useGame();
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-black text-center mb-6">Pick Your Persona</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {imageData.avatars.map(avatar => (
                        <motion.button key={avatar.id} whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }} onClick={() => { setAvatar(avatar.id); onClose(); }} className="p-2 bg-indigo-50 rounded-2xl border-2 border-transparent hover:border-indigo-300 transition-all">
                            <img src={avatar.url} alt={avatar.name} className="w-full h-auto" />
                        </motion.button>
                    ))}
                </div>
                <button onClick={onClose} className="mt-8 w-full py-3 font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition">Cancel</button>
            </motion.div>
        </motion.div>
    );
};

// --- MAIN COMPONENT ---
export default function Profile() {
  // All data now comes from the contexts
  const { questPoints, selectedAvatar, unlockedAchievements, userProgress, correctlyAnsweredQIDs, ownedItems, userData } = useGame();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // We get userData (username, joined date) from GameContext now
  const { username, joined } = userData;
  const avatarUrl = imageData.avatars.find(a => a.id === selectedAvatar)?.url;
  const { level, title, progress } = calculateLevelInfo(questPoints);
  const myInventory = storeData.items.filter(item => ownedItems.has(item.id));

  return (
    <>
      <section className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Identity */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-8 shadow-xl border-4 border-indigo-50 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-100 to-white -z-10" />
          <div className="relative mb-4">
             <ProgressRing progress={progress} level={level} />
             <div className="absolute inset-0 flex items-center justify-center">
                 <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-sm" />
             </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md text-slate-400 hover:text-indigo-500 transition">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" /></svg>
          </button>
          
          <h1 className="text-3xl font-black text-slate-800">@{username}</h1>
          <div className="mt-2 px-4 py-1 bg-indigo-100 text-indigo-700 font-bold rounded-full text-sm inline-block">{title}</div>
          <p className="mt-4 text-slate-500 font-medium">Member since {joined}</p>

          <div className="mt-auto pt-8 w-full">
            <button onClick={() => { logout(); navigate('/login'); }} className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center">
                Sign Out
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Stats Row */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Total QP" value={questPoints.toLocaleString()} emoji="💎" />
              <StatCard label="Sagas" value={userProgress.completedStages.length} emoji="🗺️" />
              <StatCard label="Badges" value={unlockedAchievements.size} emoji="🏅" />
              <StatCard label="Knowledge" value={correctlyAnsweredQIDs.size} emoji="🧠" />
          </motion.div>
          
          {/* Backpack Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-indigo-50 rounded-[2.5rem] p-8 border-4 border-white shadow-inner">
              <h3 className="text-2xl font-black text-indigo-900 mb-6 flex items-center">
                  🎒 My Backpack <span className="ml-2 text-sm bg-indigo-200 text-indigo-800 px-3 py-1 rounded-full">{myInventory.length} items</span>
              </h3>
              
              {myInventory.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {myInventory.map(item => <InventoryItem key={item.id} item={item} />)}
                  </div>
              ) : (
                  <div className="text-center py-10 border-2 border-dashed border-indigo-200 rounded-2xl">
                      <p className="text-indigo-400 font-bold text-lg">Your backpack is empty!</p>
                      <p className="text-indigo-300 mt-2">Visit the store to spend your QP.</p>
                  </div>
              )}
          </motion.div>
        </div>
      </section>
      <AnimatePresence>{isModalOpen && <AvatarSelectionModal onClose={() => setIsModalOpen(false)} />}</AnimatePresence>
    </>
  );
}