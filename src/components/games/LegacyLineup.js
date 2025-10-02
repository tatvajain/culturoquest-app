import React, { useState, useEffect } from 'react';
import sagaData from '../../data/mauryanEmpire.json';
import { useGame } from '../../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import GameSummary from '../common/GameSummary';

// --- Smart Question Selector ---
const getSmartRandomSet = (questionBank, answeredQIDs) => {
    const unansweredSets = questionBank.filter(set => 
        !set.rulers.every(ruler => answeredQIDs.has(ruler.id))
    );
    if (unansweredSets.length > 0) {
        return unansweredSets[Math.floor(Math.random() * unansweredSets.length)];
    }
    return questionBank[Math.floor(Math.random() * questionBank.length)];
};

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

const correctSound = new window.Tone.Synth().toDestination();
const wrongSound = new window.Tone.Synth({ oscillator: { type: 'square' } }).toDestination();

export default function LegacyLineup({ onGameComplete }) {
  const { addPoints, correctlyAnsweredQIDs, markQuestionCorrect } = useGame();
  const gameData = sagaData.games.legacyLineup;
  
  const [questionSet, setQuestionSet] = useState(null);
  const [unsortedItems, setUnsortedItems] = useState([]);
  const [lineup, setLineup] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [roundScore, setRoundScore] = useState(0);
  const [isCorrect, setIsCorrect] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false); // New state to track if user has submitted

  useEffect(() => {
    const set = getSmartRandomSet(gameData.questionBank, correctlyAnsweredQIDs);
    setQuestionSet(set);
    setUnsortedItems(shuffleArray(set.rulers));
    setLineup(Array(set.rulers.length).fill(null));
  }, []);

  const handleDragStart = (e, item, source, index = -1) => {
    e.dataTransfer.setData("item", JSON.stringify({ ...item, source, index }));
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropOnLineup = (e, dropIndex) => {
    if (isSubmitted) return; // Don't allow changes after submitting
    const itemData = JSON.parse(e.dataTransfer.getData("item"));
    const newLineup = [...lineup];
    
    if (itemData.source === 'rack') {
        setUnsortedItems(prev => prev.filter(i => i.id !== itemData.id));
    } else if (itemData.source === 'lineup') {
        newLineup[itemData.index] = null;
    }
    
    if (newLineup[dropIndex]) {
        setUnsortedItems(prev => [...prev, newLineup[dropIndex]]);
    }

    newLineup[dropIndex] = itemData;
    setLineup(newLineup);
  };

  const handleDropOnRack = (e) => {
    if (isSubmitted) return;
    const itemData = JSON.parse(e.dataTransfer.getData("item"));

    if (itemData.source === 'lineup') {
        setUnsortedItems(prev => [...prev, itemData]);
        const newLineup = [...lineup];
        newLineup[itemData.index] = null;
        setLineup(newLineup);
    }
  };

  const handleCheckOrder = () => {
    if (!questionSet || lineup.some(item => item === null) || isSubmitted) {
        return;
    }

    setIsSubmitted(true); // Lock the board
    let correctlyPlacedCount = 0;
    lineup.forEach((item, index) => {
        if (item && item.id === questionSet.rulers[index].id) {
            correctlyPlacedCount++;
            markQuestionCorrect(item.id);
        }
    });

    const isPerfect = correctlyPlacedCount === questionSet.rulers.length;
    setIsCorrect(isPerfect);

    const pointsWon = correctlyPlacedCount * 30;
    addPoints(pointsWon);
    setRoundScore(pointsWon);

    if (isPerfect) {
      correctSound.triggerAttackRelease("C4", "8n");
    } else {
      wrongSound.triggerAttackRelease("C2", "8n");
    }
    
    setTimeout(() => setIsGameOver(true), 2500); // Give user time to see feedback
  };

  if (isGameOver) {
    const correctlyPlaced = lineup.filter((item, index) => item && item.id === questionSet.rulers[index].id).length;
    const stats = { 
        score: roundScore, 
        correct: correctlyPlaced, 
        total: questionSet.rulers.length, 
        perfectionBonus: 0 
    };
    return <GameSummary stats={stats} onComplete={onGameComplete} />;
  }

  if (!questionSet) return <div className="text-center p-8">Loading dynasty...</div>;

  return (
    <div className="w-full max-w-4xl mx-auto bg-amber-50 rounded-2xl shadow-xl border-2 border-amber-200">
      <div className="p-6 text-center border-b-2 border-amber-200">
        <h2 className="text-3xl font-extrabold text-amber-900 font-serif">{questionSet.dynasty} Lineup</h2>
        <p className="mt-1 text-amber-800">{gameData.instruction}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
        {/* Left Column: Unsorted Rulers */}
        <div 
            className="bg-amber-100/50 p-4 rounded-lg border-2 border-dashed border-amber-300 min-h-[300px]"
            onDrop={handleDropOnRack}
            onDragOver={handleDragOver}
        >
            <h3 className="font-bold text-amber-900 mb-4 text-center">Available Heirs</h3>
            <div className="space-y-3">
                <AnimatePresence>
                    {unsortedItems.map(item => (
                        <motion.div 
                            key={item.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            draggable={!isSubmitted}
                            onDragStart={(e) => handleDragStart(e, item, 'rack')}
                            className="p-4 bg-stone-200 rounded-lg cursor-grab active:cursor-grabbing shadow-md border border-stone-300 text-center font-semibold text-stone-700"
                        >
                            {item.name}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>

        {/* Right Column: Your Lineup (Drop Zones) */}
        <div>
            <h3 className="font-bold text-amber-900 mb-4 text-center">The Royal Succession</h3>
            <div className="space-y-3">
                {lineup.map((item, index) => {
                    const isSlotCorrect = isSubmitted && item && item.id === questionSet.rulers[index].id;
                    const isSlotIncorrect = isSubmitted && item && item.id !== questionSet.rulers[index].id;

                    return (
                        <div 
                            key={index}
                            onDrop={(e) => handleDropOnLineup(e, index)}
                            onDragOver={handleDragOver}
                            className={`flex items-center p-2 rounded-lg border-2 border-dashed min-h-[68px] shadow-inner transition-colors duration-300
                                ${isSlotCorrect ? 'border-green-500 bg-green-100' : ''}
                                ${isSlotIncorrect ? 'border-red-500 bg-red-100' : ''}
                                ${!isSubmitted ? 'border-amber-400 bg-amber-100' : ''}
                            `}
                        >
                            <span className="text-lg font-bold text-amber-600 mr-4">{index + 1}.</span>
                            {item && (
                                <motion.div 
                                    layout
                                    draggable={!isSubmitted}
                                    onDragStart={(e) => handleDragStart(e, item, 'lineup', index)}
                                    className="w-full bg-white p-3 rounded-md shadow-lg text-center font-semibold text-slate-800 cursor-grab active:cursor-grabbing"
                                >
                                    {item.name}
                                </motion.div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
      </div>

      <div className="p-6 bg-amber-100/50 border-t-2 border-amber-200 rounded-b-2xl">
        <button 
          onClick={handleCheckOrder}
          disabled={isSubmitted}
          className="w-full px-8 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold hover:scale-105 transition-transform shadow-lg shadow-orange-500/20 disabled:bg-slate-400 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {isSubmitted ? 'Checked!' : 'Finalize Succession'}
        </button>
      </div>
    </div>
  );
}

