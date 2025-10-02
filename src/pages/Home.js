import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// --- Sub-Components for the Dashboard ---

// A generic, reusable container for our dashboard widgets
const DashboardWidget = ({ children, className = '' }) => (
  <div className={`bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 shadow-lg ${className}`}>
    {children}
  </div>
);

// A widget to show the user's primary ongoing quest
const ContinueQuestWidget = () => (
    <div className="relative p-8 rounded-2xl overflow-hidden bg-cover bg-center text-white shadow-2xl" style={{backgroundImage: "url('https://i.imgur.com/O6wW29j.jpeg')"}}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20"></div>
        <div className="relative z-10">
            <p className="font-bold text-slate-200">CONTINUE YOUR JOURNEY</p>
            <h3 className="text-4xl font-extrabold mt-2 drop-shadow-md">The Mauryan Empire</h3>
            <p className="mt-2 text-slate-300">Arrange the events of Ashoka's reign in the correct order.</p>
            <Link to="/quests">
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-6 px-6 py-3 rounded-full bg-white text-slate-800 font-bold"
                >
                    Play Timeline Jigsaw
                </motion.button>
            </Link>
        </div>
    </div>
);

// A widget for a daily challenge to encourage return visits
const DailyChallengeWidget = () => (
    <DashboardWidget>
        <h4 className="font-bold text-slate-800 text-lg">Daily Challenge 🎯</h4>
        <p className="text-sm text-slate-500 mt-1">Complete this quest for a bonus!</p>
        <div className="mt-4 bg-slate-100 p-4 rounded-lg text-center">
            <p className="font-semibold text-slate-700">Artisan's Eye</p>
            <p className="font-bold text-2xl text-green-500 mt-1">+250 QP Bonus</p>
        </div>
        <Link to="/quests">
             <motion.button 
                whileHover={{ scale: 1.05 }}
                className="w-full mt-4 py-2 bg-teal-500 text-white font-bold rounded-full"
            >
                Accept Challenge
            </motion.button>
        </Link>
    </DashboardWidget>
);

// A snapshot of the leaderboard to foster competition
const LeaderboardSnapshotWidget = () => {
    const topPlayers = [
        { rank: 1, name: "VidushiV", qp: 15200 },
        { rank: 2, name: "RohanRox", qp: 14850 },
        { rank: 3, name: "TatvaTheExplorer", qp: 12500 }
    ];
    return (
        <DashboardWidget>
            <h4 className="font-bold text-slate-800 text-lg">Leaderboard Snapshot 🏆</h4>
             <div className="mt-4 space-y-3">
                {topPlayers.map(player => (
                    <div key={player.rank} className="flex items-center justify-between bg-slate-100 p-3 rounded-lg">
                        <div className="flex items-center">
                            <span className="font-bold text-slate-500 w-6">{player.rank}.</span>
                            <span className="font-semibold text-slate-700">{player.name}</span>
                        </div>
                        <span className="font-bold text-teal-600">{player.qp.toLocaleString()} QP</span>
                    </div>
                ))}
            </div>
        </DashboardWidget>
    );
};

// --- Main Home Page (Dashboard) ---

export default function Home() {
  return (
    <section>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Welcome back, Explorer!</h1>
        <p className="mt-2 text-lg text-slate-600">Your quest for knowledge continues. Here's what's new on your desk.</p>
      </motion.div>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <motion.div 
            initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
        >
          <ContinueQuestWidget />
        </motion.div>

        {/* Sidebar Area */}
        <motion.div 
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-8"
        >
          <DailyChallengeWidget />
          <LeaderboardSnapshotWidget />
        </motion.div>
      </div>
    </section>
  );
}

