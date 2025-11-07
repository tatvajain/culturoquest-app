import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import achievementData from '../data/achievements.json';
import { useGame } from '../context/GameContext';
import imageData from '../data/imageData.json';

const AchievementCard = ({ id, title, description, unlocked }) => {
  const iconUrl = imageData.achievementIcons[id];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-6 rounded-2xl border text-center ${unlocked ? 'bg-white shadow-lg border-teal-200' : 'bg-slate-100 border-slate-200'}`}
    >
      <div className="w-24 h-24 mx-auto mb-4 p-2 bg-gradient-to-br from-slate-50 to-slate-200 rounded-full">
        <img src={iconUrl} alt={title} className={`w-full h-full rounded-full object-cover transition-all duration-500 ${!unlocked ? 'grayscale opacity-50' : ''}`}
          onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x100/cccccc/ffffff?text=?'; }} />
      </div>
      <h3 className={`font-bold text-xl ${unlocked ? 'text-slate-800' : 'text-slate-500'}`}>{title}</h3>
      <p className={`mt-2 text-sm ${unlocked ? 'text-slate-600' : 'text-slate-400'}`}>{description}</p>
    </motion.div>
  );
};

export default function Achievements() {
  const [filter, setFilter] = useState('all');
  const { allAchievements } = achievementData;
  // Get the live Set of unlocked achievements
  const { unlockedAchievements } = useGame();

  const filteredAchievements = useMemo(() => {
    return allAchievements.filter(ach => {
        if (filter === 'unlocked') return unlockedAchievements.has(ach.id);
        if (filter === 'locked') return !unlockedAchievements.has(ach.id);
        return true;
    });
  }, [filter, allAchievements, unlockedAchievements]);

  return (
    <section>
      <div className="text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">Your Achievements 🏅</h2>
        <p className="mt-2 text-lg text-slate-600">Track your progress and see what challenges await!</p>
      </div>
      <div className="flex justify-center my-8 space-x-2 bg-slate-200 p-1 rounded-full">
        {['all', 'unlocked', 'locked'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`capitalize px-6 py-2 rounded-full font-semibold transition ${filter === f ? 'bg-white shadow text-teal-700' : 'text-slate-600'}`}>{f}</button>
        ))}
      </div>
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredAchievements.map(ach => (
            <AchievementCard key={ach.id} {...ach} unlocked={unlockedAchievements.has(ach.id)} />
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}