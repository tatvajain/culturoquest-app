import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import archiveData from '../data/archiveData.json';
import { useGame } from '../context/GameContext';

const EntryCard = ({ entry, unlocked, onSelect }) => (
  <motion.div
    layout
    onClick={() => unlocked && onSelect(entry)}
    className={`p-6 rounded-2xl border text-center relative overflow-hidden transition-all duration-300 ${
      unlocked ? 'bg-white shadow-lg border-teal-200 cursor-pointer hover:-translate-y-1' : 'bg-slate-100 border-slate-200 opacity-70'
    }`}
  >
    <div className={`text-6xl mb-4 ${!unlocked ? 'grayscale blur-sm' : ''}`}>{unlocked ? entry.emoji : '🔒'}</div>
    <h3 className={`font-bold text-xl ${unlocked ? 'text-slate-800' : 'text-slate-500'}`}>{unlocked ? entry.title : 'Unknown Entry'}</h3>
    <p className={`mt-2 text-sm ${unlocked ? 'text-slate-600' : 'text-slate-400'}`}>{unlocked ? entry.summary : 'Continue your quests to unlock this knowledge.'}</p>
  </motion.div>
);

const EntryDetailModal = ({ entry, onClose }) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative" onClick={(e) => e.stopPropagation()}>
      <div className="text-8xl mb-4 text-center">{entry.emoji}</div>
      <h2 className="text-4xl font-extrabold gradient-text text-center">{entry.title}</h2>
      <div className="mt-6 space-y-4 text-lg text-slate-700 leading-relaxed max-h-[60vh] overflow-y-auto pr-4">
          <p>{entry.fullDescription}</p>
      </div>
      <div className="mt-8 text-center">
        <button onClick={onClose} className="px-8 py-3 bg-slate-100 text-slate-700 font-bold rounded-full hover:bg-slate-200 transition">Close Archive</button>
      </div>
    </motion.div>
  </div>
);

export default function Archives() {
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  // Get live unlocked entries from context
  const { unlockedArchiveEntries } = useGame();
  const { allEntries } = archiveData;

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
        <p className="mt-2 text-lg text-slate-600">Every piece of knowledge you uncover is stored here.</p>
      </div>
      <div className="flex flex-col md:flex-row gap-4 my-8 p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm">
        <input type="text" placeholder="Search archives..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-grow p-3 rounded-lg border-2 border-slate-200 focus:border-orange-500 focus:ring-0 transition" />
        <div className="flex items-center space-x-2 overflow-x-auto">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 text-sm whitespace-nowrap rounded-full font-semibold transition ${filter === cat ? 'bg-teal-500 text-white shadow-md' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>{cat}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredEntries.map(entry => (
            <EntryCard key={entry.id} entry={entry} unlocked={unlockedArchiveEntries.has(entry.id)} onSelect={setSelectedEntry} />
          ))}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {selectedEntry && <EntryDetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />}
      </AnimatePresence>
    </section>
  );
}