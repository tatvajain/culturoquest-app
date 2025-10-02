import React, { useState, useEffect, useMemo } from 'react';
import sagaData from '../../data/mauryanEmpire.json';
import { useGame } from '../../context/GameContext';
import { Reorder } from 'framer-motion';
import GameSummary from '../common/GameSummary';

// --- Smart Question Selector ---
const getSmartRandomSet = (questionBank, answeredQIDs) => {
    const unansweredSets = questionBank.filter(set => 
        !set.events.every(event => answeredQIDs.has(event.id))
    );
    
    if (unansweredSets.length > 0) {
        return unansweredSets[Math.floor(Math.random() * unansweredSets.length)];
    }
    // Fallback if all sets have been mastered once
    return questionBank[Math.floor(Math.random() * questionBank.length)];
};

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

const correctSound = new window.Tone.Synth().toDestination();
const wrongSound = new window.Tone.Synth({ oscillator: { type: 'square' } }).toDestination();
const clickSound = new window.Tone.MembraneSynth().toDestination();

export default function TimelineJigsaw({ onGameComplete }) {
  const { addPoints, correctlyAnsweredQIDs, markQuestionCorrect, spendPoints } = useGame();
  const gameData = sagaData.games.timelineJigsaw;
  
  const [questionSet, setQuestionSet] = useState(null);
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [timeLeft, setTimeLeft] = useState(90);
  const [isGameOver, setIsGameOver] = useState(false);
  const [roundScore, setRoundScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);

  useEffect(() => {
    const set = getSmartRandomSet(gameData.questionBank, correctlyAnsweredQIDs);
    setQuestionSet(set);
    setItems(shuffleArray(set.events));

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setIsGameOver(true); // End game if time runs out
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []); // Run only once when the game mounts

  const correctOrder = useMemo(() => {
    if (!questionSet) return [];
    return [...questionSet.events].sort((a, b) => a.year - b.year);
  }, [questionSet]);

  const handleCheckOrder = () => {
    clickSound.triggerAttackRelease("C1", "8n");
    if (!questionSet) return;
    const correct = items.every((item, index) => item.id === correctOrder[index].id);
    setIsCorrect(correct);
    if (correct) {
      correctSound.triggerAttackRelease("C4", "8n");
      // Mark all events in this set as correct
      questionSet.events.forEach(event => markQuestionCorrect(event.id));
      const pointsWon = 30 * questionSet.events.length; // 30 points per item
      addPoints(pointsWon);
      setRoundScore(pointsWon);
      setMessage(`🎉 Perfect! +${pointsWon} QP`);
      setTimeout(() => setIsGameOver(true), 1500);
    } else {
      wrongSound.triggerAttackRelease("C2", "8n");
      setMessage('Not quite right. The timeline is incorrect.');
    }
  };
  
  const handleHint = () => {
    clickSound.triggerAttackRelease("C1", "8n");
    if (isCorrect || !questionSet) return;

    if (hintsUsed >= 2) {
      setMessage("No more hints available for this round.");
      return;
    }

    if (spendPoints(25)) {
      const firstIncorrectIndex = items.findIndex((item, index) => item.id !== correctOrder[index].id);
      if (firstIncorrectIndex !== -1) {
        const correctItem = correctOrder[firstIncorrectIndex];
        const currentPositionOfCorrectItem = items.findIndex(item => item.id === correctItem.id);
        const newItems = [...items];
        [newItems[firstIncorrectIndex], newItems[currentPositionOfCorrectItem]] = [newItems[currentPositionOfCorrectItem], newItems[firstIncorrectIndex]];
        setItems(newItems);
        setHintsUsed(prev => prev + 1);
      } else {
        setMessage("Looks like you've already got it right!");
      }
    } else {
      setMessage("Not enough QP for a hint!");
    }
  };

  if (isGameOver) {
    const stats = {
        score: roundScore,
        correct: isCorrect ? questionSet.events.length : 0,
        total: questionSet.events.length,
        perfectionBonus: 0 // No separate perfection bonus for this game type
    };
    return <GameSummary stats={stats} onComplete={onGameComplete} />;
  }

  if (!questionSet) return <div className="text-center p-8">Loading timeline...</div>;

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200">
      <div className="p-6 flex justify-between items-center border-b-2 border-slate-200">
        <div className="text-left">
          <h2 className="text-3xl font-extrabold gradient-text">{gameData.title}</h2>
          <p className="mt-1 text-slate-600">{gameData.instruction}</p>
        </div>
        <div className="text-center">
            <div className="text-3xl font-bold text-red-500">{timeLeft}</div>
            <div className="text-xs text-slate-500">SECONDS LEFT</div>
        </div>
      </div>
      <div className="p-6 md:p-8">
        <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-4">
          {items.map((item, index) => (
            <Reorder.Item 
              key={item.id} 
              value={item}
              className="flex items-center p-4 bg-slate-100 rounded-lg cursor-grab active:cursor-grabbing shadow-sm border border-slate-200"
            >
              <span className="text-lg font-bold text-teal-500 mr-4">{index + 1}.</span>
              <span className="text-slate-800">{item.event}</span>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
      <div className="p-6 bg-slate-50 rounded-b-2xl">
        {message && <div className={`p-3 rounded-lg text-center mb-4 font-semibold ${isCorrect === true ? 'bg-green-100 text-green-800' : isCorrect === false ? 'bg-red-100 text-red-800' : ''}`}>{message}</div>}
        <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleHint} 
              className="px-8 py-3 rounded-full bg-teal-500 text-white font-bold transition-transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed"
              disabled={hintsUsed >= 2 || isCorrect}
            >
              Hint (-25 QP) <span className="text-teal-200 text-xs">({2 - hintsUsed} left)</span>
            </button>
            <button onClick={handleCheckOrder} className="px-8 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold transition-transform hover:scale-105 shadow-lg shadow-orange-500/20">Check Answer</button>
        </div>
      </div>
    </div>
  );
}

