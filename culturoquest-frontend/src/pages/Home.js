import React, { useState, useEffect } from 'react'; // <--- FIX: Added { useState, useEffect }
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import stagesData from '../data/stagesData.json';
import imageData from '../data/imageData.json';

const DashboardWidget = ({ children, className = '' }) => (
  <div className={`bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 shadow-lg ${className}`}>
    {children}
  </div>
);

// --- REAL LEADERBOARD WIDGET ---
const LeaderboardSnapshotWidget = () => {
    const [topPlayers, setTopPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Define API_URL here to use the environment variable
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/users';

    useEffect(() => {
        fetch(`${API_URL}/leaderboard`)
            .then(res => res.json())
            .then(data => {
                setTopPlayers(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch leaderboard:", err);
                setLoading(false);
            });
    }, [API_URL]);

    return (
        <DashboardWidget>
            <h4 className="font-bold text-slate-800 text-lg flex items-center">
                🏆 Top Explorers
            </h4>
            <div className="mt-4 space-y-3">
                {loading ? (
                    <p className="text-sm text-slate-500 animate-pulse">Finding top scholars...</p>
                ) : topPlayers.length > 0 ? (
                    topPlayers.map((player, index) => {
                        // Use fallback if avatar ID doesn't match anything in imageData
                        const avatarObj = imageData.avatars.find(a => a.id === player.avatar);
                        const avatarUrl = avatarObj ? avatarObj.url : imageData.avatars[0].url;
                        
                        return (
                            <motion.div 
                                key={player._id || index}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between bg-white/50 p-3 rounded-xl border border-slate-100"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="font-black text-slate-400 w-6 text-center">
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                                    </div>
                                    <img src={avatarUrl} alt={player.username} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                                    <span className="font-bold text-slate-700 truncate max-w-[100px]" title={player.username}>
                                        {player.username}
                                    </span>
                                </div>
                                <span className="font-black text-teal-600 text-sm">
                                    {player.questPoints.toLocaleString()} QP
                                </span>
                            </motion.div>
                        );
                    })
                ) : (
                    <p className="text-sm text-slate-500">Be the first to play!</p>
                )}
            </div>
        </DashboardWidget>
    );
};

// --- MAIN HOME COMPONENT ---
export default function Home() {
  const { userProgress, userData } = useGame();
  const { username } = userData;

  const currentStageId = userProgress.activeStages[0];
  const currentStage = stagesData.stages.find(s => s.id === currentStageId);

  return (
    <section>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Welcome back, <span className="gradient-text">{username}</span>!</h1>
        <p className="mt-2 text-lg text-slate-600">Your quest for knowledge continues. Here's what's next.</p>
      </motion.div>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="lg:col-span-2">
             <div className="relative p-8 rounded-3xl overflow-hidden bg-slate-800 text-white shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10">
                    <p className="font-bold text-slate-300 uppercase tracking-wider flex items-center">
                        <span className="mr-2">🧭</span> Current Objective
                    </p>
                    <h3 className="text-4xl font-extrabold mt-2">{currentStage ? currentStage.name : "Loading..."}</h3>
                    <p className="mt-2 text-slate-300 text-lg">{currentStage ? currentStage.description : "Preparing your next adventure."}</p>
                    <Link to="/explore">
                        <motion.button 
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }} 
                            className="mt-8 px-8 py-4 rounded-2xl bg-white text-slate-900 font-black text-xl shadow-lg"
                        >
                            CONTINUE JOURNEY ➜
                        </motion.button>
                    </Link>
                </div>
            </div>
        </motion.div>

        {/* Sidebar Area */}
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="space-y-8">
          <DashboardWidget>
              <h4 className="font-bold text-slate-800 text-lg">Daily Challenge 🎯</h4>
              <p className="text-sm text-slate-500 mt-1">Complete a Riddle of the Sages today for bonus QP!</p>
              <Link to="/quests">
                   <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full mt-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold rounded-xl shadow-md">
                      PLAY NOW
                  </motion.button>
              </Link>
          </DashboardWidget>
          
          {/* Real Leaderboard Widget */}
          <LeaderboardSnapshotWidget />
        </motion.div>
      </div>
    </section>
  );
}