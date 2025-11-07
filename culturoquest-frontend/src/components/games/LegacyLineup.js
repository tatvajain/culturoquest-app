import React, { useState, useEffect } from 'react';
import sagaData from '../../data/mauryanEmpire.json';
import { useGame } from '../../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import GameSummary from '../common/GameSummary';
import FeedbackModal from '../common/FeedbackModal';

// --- ROBUST AUDIO ---
let lastSoundTime = 0;
const safePlaySound = (url) => {
    const now = Date.now();
    if (now - lastSoundTime < 250) return;
    lastSoundTime = now;
    try { new Audio(url).play().catch(() => {}); } catch (e) {}
};
const playCorrect = () => safePlaySound('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
const playWrong = () => safePlaySound('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3');

const getSmartRandomSet = (questionBank, answeredQIDs) => {
    const unanswered = questionBank.filter(set => !set.rulers.every(r => answeredQIDs.has(r.id)));
    return unanswered.length > 0 ? unanswered[Math.floor(Math.random() * unanswered.length)] : questionBank[Math.floor(Math.random() * questionBank.length)];
};

export default function LegacyLineup({ onGameComplete }) {
  const { addPoints, correctlyAnsweredQIDs, markQuestionCorrect } = useGame();
  const gameData = sagaData.games.legacyLineup;
  const [questionSet, setQuestionSet] = useState(null);
  const [unsortedItems, setUnsortedItems] = useState([]);
  const [lineup, setLineup] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [roundScore, setRoundScore] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCorrect, setModalCorrect] = useState(false);

  useEffect(() => {
      const set = getSmartRandomSet(gameData.questionBank, correctlyAnsweredQIDs);
      setQuestionSet(set);
      setUnsortedItems([...set.rulers].sort(() => 0.5 - Math.random()));
      setLineup(Array(set.rulers.length).fill(null));
  }, []);

  // ... (Keep handleDragStart, handleDragOver, handleDropOnLineup, handleDropOnRack exactly as they were before to save space, they don't need changes for this feature) ...
  // RE-ADD them here if you don't have the previous code handy, let me know. Assuming you do.
   const handleDragStart = (e, item, source, index = -1) => { e.dataTransfer.setData("item", JSON.stringify({ ...item, source, index })); };
   const handleDragOver = (e) => { e.preventDefault(); };
   const handleDropOnLineup = (e, dropIndex) => {
        const itemData = JSON.parse(e.dataTransfer.getData("item"));
        const newLineup = [...lineup];
        if (itemData.source === 'rack') setUnsortedItems(prev => prev.filter(i => i.id !== itemData.id));
        else if (itemData.source === 'lineup') newLineup[itemData.index] = null;
        if (newLineup[dropIndex]) setUnsortedItems(prev => [...prev, newLineup[dropIndex]]);
        newLineup[dropIndex] = itemData;
        setLineup(newLineup);
   };
   const handleDropOnRack = (e) => {
       const itemData = JSON.parse(e.dataTransfer.getData("item"));
       if (itemData.source === 'lineup') {
           setUnsortedItems(prev => [...prev, itemData]);
           const newLineup = [...lineup];
           newLineup[itemData.index] = null;
           setLineup(newLineup);
       }
   };

  const handleCheck = () => {
      if (!questionSet || lineup.some(i => i === null)) return;
      
      let correctCount = 0;
      lineup.forEach((item, i) => {
          if (item && item.id === questionSet.rulers[i].id) {
              correctCount++;
              markQuestionCorrect(item.id);
          }
      });
      
      const isPerfect = correctCount === questionSet.rulers.length;
      setModalCorrect(isPerfect);
      if (isPerfect) playCorrect(); else playWrong();
      
      const points = correctCount * 30;
      addPoints(points);
      setRoundScore(points);
      setModalOpen(true);
  };

  if (isGameOver) {
      // Recalculate correct count for summary
       const correctCount = lineup.filter((item, i) => item && item.id === questionSet.rulers[i].id).length;
       const stats = { score: roundScore, correct: correctCount, total: questionSet.rulers.length, perfectionBonus: 0 };
       return <GameSummary stats={stats} onComplete={onGameComplete} />;
  }

  if (!questionSet) return <div className="p-8 text-center">Loading...</div>;

  return (
      <div className="w-full max-w-4xl mx-auto bg-amber-50 rounded-3xl shadow-xl border-4 border-amber-200 p-6">
          <h2 className="text-3xl font-black text-amber-900 text-center mb-6">{questionSet.dynasty} Lineup</h2>
          {/* ... (Grid layout for drag/drop zones - keep same as before) ... */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
            <div className="bg-amber-100/50 p-4 rounded-2xl border-2 border-dashed border-amber-300 min-h-[300px]" onDrop={handleDropOnRack} onDragOver={handleDragOver}>
                <h3 className="font-bold text-amber-900 mb-4 text-center">Heirs</h3>
                <div className="space-y-3">
                    <AnimatePresence>
                        {unsortedItems.map(item => (
                            <motion.div key={item.id} layout draggable onDragStart={(e) => handleDragStart(e, item, 'rack')} className="p-3 bg-white rounded-xl shadow-md font-bold text-center cursor-grab active:cursor-grabbing">
                                {item.name}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
            <div>
                <h3 className="font-bold text-amber-900 mb-4 text-center">Throne Succession</h3>
                <div className="space-y-3">
                    {lineup.map((item, i) => (
                        <div key={i} onDrop={(e) => handleDropOnLineup(e, i)} onDragOver={handleDragOver} className="flex items-center p-2 rounded-xl border-2 border-dashed border-amber-300 bg-amber-100/30 min-h-[60px]">
                            <span className="text-xl font-black text-amber-500 mr-4">{i + 1}.</span>
                            {item && <motion.div layout draggable onDragStart={(e) => handleDragStart(e, item, 'lineup', i)} className="w-full bg-white p-2 rounded-lg shadow font-bold text-center cursor-grab">{item.name}</motion.div>}
                        </div>
                    ))}
                </div>
            </div>
          </div>
          <button onClick={handleCheck} disabled={lineup.some(i => i === null)} className="w-full mt-6 py-4 bg-amber-600 text-white font-black rounded-2xl disabled:opacity-50 transition hover:scale-105">CROWN THEM!</button>
          <FeedbackModal isOpen={modalOpen} isCorrect={modalCorrect} onClose={() => setIsGameOver(true)} educationalLink={questionSet.educationalLink} correctMessage="Long live the kings! 👑" wrongMessage="The lineage is broken! 💔" />
      </div>
  );
}