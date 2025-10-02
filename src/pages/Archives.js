import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import archiveData from '../data/archiveData.json';

// --- Sub-Components ---

const EntryCard = ({ entry, unlocked, onSelect }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    onClick={() => unlocked && onSelect(entry)}
    className={`p-6 rounded-2xl border text-center relative overflow-hidden ${
      unlocked 
        ? 'bg-white shadow-lg border-teal-200 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all' 
        : 'bg-slate-100 border-slate-200'
    }`}
  >
    <div className={`text-6xl mb-4 transition-all ${!unlocked ? 'grayscale' : ''}`}>{unlocked ? entry.emoji : '❓'}</div>
    <h3 className={`font-bold text-xl ${unlocked ? 'text-slate-800' : 'text-slate-500'}`}>{unlocked ? entry.title : '??????'}</h3>
    <p className={`mt-2 text-sm ${unlocked ? 'text-slate-600' : 'text-slate-400'}`}>{unlocked ? entry.summary : 'Complete related quests to unlock this entry.'}</p>
  </motion.div>
);

const EntryDetailModal = ({ entry, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.7, opacity: 0 }}
      transition={{ type: 'spring' }}
      className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full text-center p-8 relative"
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
    >
      <div className="text-8xl mb-4">{entry.emoji}</div>
      <h2 className="text-4xl font-extrabold gradient-text">{entry.title}</h2>
      <p className="mt-4 text-lg text-slate-600 leading-relaxed">{entry.fullDescription}</p>
      <button onClick={onClose} className="mt-8 px-6 py-2 bg-slate-200 text-slate-700 font-semibold rounded-full hover:bg-slate-300 transition">
        Close
      </button>
    </motion.div>
  </motion.div>
);

// --- Main Page Component ---

export default function Archives() {
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const { allEntries, userUnlockedEntries } = archiveData;

  const categories = ['All', ...new Set(allEntries.map(e => e.category))];

  const filteredEntries = useMemo(() => {
    return allEntries.filter(entry => {
      const matchesFilter = filter === 'All' || entry.category === filter;
      const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchTerm, allEntries]);

  return (
    <section>
      <div className="text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">The Archives 🏛️</h2>
        <p className="mt-2 text-lg text-slate-600">Every piece of knowledge you uncover on your journey is stored here.</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 my-8 p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex-grow">
          <input 
            type="text"
            placeholder="Search for an entry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 rounded-lg border-2 border-slate-200 focus:border-orange-500 focus:ring-0 transition"
          />
        </div>
        <div className="flex items-center space-x-2 bg-slate-200 p-1 rounded-full overflow-x-auto">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 text-sm whitespace-nowrap rounded-full font-semibold transition ${filter === cat ? 'bg-white shadow' : 'text-slate-600'}`}>{cat}</button>
          ))}
        </div>
      </div>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredEntries.map(entry => (
            <EntryCard 
              key={entry.id}
              entry={entry}
              unlocked={userUnlockedEntries.includes(entry.id)}
              onSelect={setSelectedEntry}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {selectedEntry && (
          <EntryDetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}