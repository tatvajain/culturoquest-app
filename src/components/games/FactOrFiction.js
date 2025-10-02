import React, { useState, useEffect } from 'react';
import sagaData from '../../data/culturalTrivia.json';
import { useGame } from '../../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import GameSummary from '../common/GameSummary';

// --- Smart Question Selector ---
const getSmartQuestions = (questionBank, answeredQIDs, num) => {
  const unanswered = questionBank.filter(q => !answeredQIDs.has(q.id));
  const shuffledUnanswered = [...unanswered].sort(() => 0.5 - Math.random());
  let selected = shuffledUnanswered.slice(0, num);
  if (selected.length < num) {
    const answered = questionBank.filter(q => answeredQIDs.has(q.id));
    const shuffledAnswered = [...answered].sort(() => 0.5 - Math.random());
    selected.push(...shuffledAnswered.slice(0, num - selected.length));
  }
  return selected;
};

const correctSound = new window.Tone.Synth().toDestination();
const wrongSound = new window.Tone.Synth({ oscillator: { type: 'square' } }).toDestination();

// --- New UI Sub-Component ---
const StatementCard = ({ statement, onSelect, isAnswered, isSelected, isFiction }) => {
    const getCardStyle = () => {
        if (!isAnswered) return 'bg-white hover:border-indigo-400 hover:shadow-xl';
        if (isFiction) return 'bg-green-100 border-green-500';
        if (isSelected && !isFiction) return 'bg-red-100 border-red-500';
        return 'bg-white opacity-50';
    };

    return (
        <motion.div
            onClick={() => onSelect(statement)}
            className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 h-full flex flex-col justify-center shadow-lg ${getCardStyle()}`}
            whileHover={!isAnswered ? { y: -8, scale: 1.03 } : {}}
            whileTap={!isAnswered ? { scale: 0.98 } : {}}
        >
            <p className="text-center text-slate-700 font-medium text-lg">{statement.text}</p>
            {isAnswered && (
                 <motion.div 
                    initial={{scale: 0, opacity: 0, rotate: -45}} 
                    animate={{scale: 1, opacity: 1, rotate: -20}}
                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl font-black uppercase tracking-widest pointer-events-none ${isFiction ? 'text-red-500/70' : 'text-green-500/70'}`}
                >
                    {isFiction ? 'Fiction' : 'Fact'}
                </motion.div>
            )}
        </motion.div>
    );
};


export default function FactOrFiction({ onGameComplete }) {
  const { addPoints, correctlyAnsweredQIDs, markQuestionCorrect } = useGame();
  const gameData = sagaData.games.factOrFiction;
  
  const [gameQuestions, setGameQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    setGameQuestions(getSmartQuestions(gameData.questionBank, correctlyAnsweredQIDs, 5));
  }, []);

  const currentSet = gameQuestions[currentQuestionIndex];

  const handleNextQuestion = () => {
    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < gameQuestions.length) {
        setCurrentQuestionIndex(nextQuestionIndex);
        setIsAnswered(false);
        setSelected(null);
    } else {
        setIsGameOver(true);
        if (correctAnswers === 5) {
            addPoints(50);
        }
    }
  };

  const handleStatementClick = (statement) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelected(statement);

    if (statement.isFiction) {
      correctSound.triggerAttackRelease("C4", "8n");
      markQuestionCorrect(currentSet.id);
      setCorrectAnswers(prev => prev + 1);
      const pointsWon = 30;
      setRoundScore(prev => prev + pointsWon);
      addPoints(pointsWon);
    } else {
      wrongSound.triggerAttackRelease("C2", "8n");
    }
    setTimeout(handleNextQuestion, 3000);
  };

  if (isGameOver) {
    const stats = {
      score: roundScore,
      correct: correctAnswers,
      total: 5,
      perfectionBonus: correctAnswers === 5 ? 50 : 0
    };
    return <GameSummary stats={stats} onComplete={onGameComplete} />;
  }

  if (!currentSet) return <div className="text-center p-8">Loading statements...</div>;
  
  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-100 rounded-2xl shadow-xl border-2 border-slate-200 p-6 md:p-8">
      <div className="text-center pb-6 border-b-2 border-slate-300">
        <h2 className="text-4xl font-extrabold text-indigo-900 font-serif">{gameData.title}</h2>
        <p className="mt-1 text-slate-600">Question {currentQuestionIndex + 1} of 5: Find the fictional statement.</p>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8"
        >
          {currentSet.statements.map((stmt, index) => (
              <StatementCard
                key={index}
                statement={stmt}
                onSelect={handleStatementClick}
                isAnswered={isAnswered}
                isSelected={selected === stmt}
                isFiction={stmt.isFiction}
              />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

