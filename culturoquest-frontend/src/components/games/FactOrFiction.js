import React, { useState, useEffect } from 'react';
import sagaData from '../../data/culturalTrivia.json';
import { useGame } from '../../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import GameSummary from '../common/GameSummary';
import FeedbackModal from '../common/FeedbackModal'; // <--- IMPORTED

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

const getSmartQuestions = (questionBank, answeredQIDs, num) => {
  const unanswered = questionBank.filter(q => !answeredQIDs.has(q.id));
  const shuffledUnanswered = [...unanswered].sort(() => 0.5 - Math.random());
  let selected = shuffledUnanswered.slice(0, num);
  if (selected.length < num) {
    const answered = questionBank.filter(q => answeredQIDs.has(q.id));
    selected.push(...[...answered].sort(() => 0.5 - Math.random()).slice(0, num - selected.length));
  }
  return selected;
};

const StatementCard = ({ statement, onSelect, isAnswered, isSelected, isFiction }) => {
    const getCardStyle = () => {
        if (!isAnswered) return 'bg-white hover:border-indigo-400 hover:shadow-xl hover:scale-105';
        if (isFiction) return 'bg-green-100 border-green-500 shadow-none scale-100';
        if (isSelected && !isFiction) return 'bg-red-100 border-red-500 shadow-none scale-95 opacity-60';
        return 'bg-slate-50 opacity-50 scale-95 border-slate-200';
    };

    return (
        <motion.div
            onClick={() => !isAnswered && onSelect(statement)}
            className={`relative p-6 rounded-3xl border-4 cursor-pointer transition-all duration-300 h-full flex flex-col justify-center shadow-md ${getCardStyle()}`}
            whileTap={!isAnswered ? { scale: 0.95 } : {}}
        >
            <p className="text-center text-slate-800 font-bold text-lg">{statement.text}</p>
            {isAnswered && (statement.isFiction || isSelected) && (
                 <motion.div 
                    initial={{scale: 0, opacity: 0}} 
                    animate={{scale: 1, opacity: 1}}
                    className={`absolute -top-3 -right-3 px-4 py-1 rounded-full text-white font-black uppercase tracking-wider shadow-sm ${statement.isFiction ? 'bg-green-500' : 'bg-red-500'}`}
                >
                    {statement.isFiction ? 'FICTION!' : 'FACT'}
                </motion.div>
            )}
        </motion.div>
    );
};

export default function FactOrFiction({ onGameComplete }) {
  const { addPoints, markQuestionCorrect, correctlyAnsweredQIDs } = useGame();
  const gameData = sagaData.games.factOrFiction;
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  
  // --- MODAL STATE ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCorrect, setModalCorrect] = useState(false);

  useEffect(() => {
    setQuestions(getSmartQuestions(gameData.questionBank, correctlyAnsweredQIDs, 5));
  }, []);

  const currentSet = questions[currentIndex];

  const handleNext = () => {
    setModalOpen(false);
    setSelected(null);
    const next = currentIndex + 1;
    if (next < questions.length) {
        setCurrentIndex(next);
    } else {
        setIsGameOver(true);
        if (correctAnswers === 5) addPoints(50);
    }
  };

  const handleSelect = (stmt) => {
    if (selected) return;
    setSelected(stmt);
    if (stmt.isFiction) {
      playCorrect();
      markQuestionCorrect(currentSet.id);
      setCorrectAnswers(prev => prev + 1);
      addPoints(30);
      setRoundScore(prev => prev + 30);
      setModalCorrect(true);
    } else {
      playWrong();
      setModalCorrect(false);
    }
    setTimeout(() => setModalOpen(true), 600); // Slight delay so they see the card turn red/green first
  };

  if (isGameOver) {
    const stats = { score: roundScore, correct: correctAnswers, total: 5, perfectionBonus: correctAnswers === 5 ? 50 : 0 };
    return <GameSummary stats={stats} onComplete={onGameComplete} />;
  }

  if (!currentSet) return <div className="p-8 text-center font-bold text-2xl text-slate-400 animate-pulse">Loading...</div>;
  
  return (
    <div className="w-full max-w-5xl mx-auto bg-indigo-50 rounded-[3rem] shadow-2xl border-8 border-white p-6 md:p-10 relative overflow-hidden">
       <div className="absolute top-0 left-0 w-full h-6 bg-indigo-100">
         <motion.div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500" initial={{ width: 0 }} animate={{ width: `${(currentIndex / 5) * 100}%` }} />
       </div>
      <div className="text-center pb-6 mt-8">
        <h2 className="text-5xl font-black text-indigo-900 tracking-tight">{gameData.title}</h2>
        <p className="mt-3 text-xl font-bold text-indigo-600 bg-indigo-100 inline-block px-6 py-2 rounded-full">Question {currentIndex + 1} / 5</p>
        <p className="mt-4 text-xl text-slate-600 font-medium">Tap the one statement that is <span className="font-black text-red-500 underline decoration-wavy">NOT TRUE</span>!</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {currentSet.statements.map((stmt, i) => (
            <StatementCard key={i} statement={stmt} onSelect={handleSelect} isAnswered={!!selected} isSelected={selected === stmt} isFiction={stmt.isFiction} />
        ))}
      </div>
      {/* CONNECTED MODAL */}
      <FeedbackModal 
        isOpen={modalOpen}
        isCorrect={modalCorrect}
        onClose={handleNext}
        educationalLink={currentSet.educationalLink}
        correctMessage="YOU FOUND THE LIE! 🎉"
        wrongMessage="OOPS! THAT'S A FACT! 😮"
      />
    </div>
  );
}