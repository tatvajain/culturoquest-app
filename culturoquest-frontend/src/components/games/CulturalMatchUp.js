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
  const shuffled = [...unanswered].sort(() => 0.5 - Math.random());
  let selected = shuffled.slice(0, num);
  if (selected.length < num) {
    const answered = questionBank.filter(q => answeredQIDs.has(q.id));
    selected.push(...[...answered].sort(() => 0.5 - Math.random()).slice(0, num - selected.length));
  }
  return selected;
};

export default function CulturalMatchUp({ onGameComplete }) {
  const { addPoints, markQuestionCorrect, correctlyAnsweredQIDs, unlockAchievement } = useGame();
  const gameData = sagaData.games.culturalMatchUp;
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(12); // More time for kids
  const [selected, setSelected] = useState(null);
  const [timerActive, setTimerActive] = useState(true);

  // --- MODAL STATE ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCorrect, setModalCorrect] = useState(false);
  const [timeoutHappened, setTimeoutHappened] = useState(false);

  useEffect(() => {
    setQuestions(getSmartQuestions(gameData.questionBank, correctlyAnsweredQIDs, 5));
  }, []);

  const currentQ = questions[currentIndex];

  const handleNext = () => {
    setModalOpen(false);
    const next = currentIndex + 1;
    if (next < questions.length) {
      setCurrentIndex(next);
      setSelected(null);
      setTimeLeft(12);
      setTimerActive(true);
      setTimeoutHappened(false);
    } else {
      setIsGameOver(true);
      if (correctAnswers === 5) addPoints(50);
    }
  };

  useEffect(() => {
    if (!timerActive || isGameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // TIME UP!
          playWrong();
          setStreak(0);
          setModalCorrect(false);
          setTimeoutHappened(true);
          setTimerActive(false);
          setModalOpen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timerActive, currentIndex]);

  const handleSelect = (opt) => {
    if (!timerActive) return;
    setTimerActive(false);
    setSelected(opt);

    if (opt === currentQ.answer) {
      playCorrect();
      markQuestionCorrect(currentQ.id);
      setCorrectAnswers(prev => prev + 1);
      addPoints(30);
      setRoundScore(prev => prev + 30);
      setStreak(s => { if (s + 1 >= 5) unlockAchievement('five_streak'); return s + 1; });
      setModalCorrect(true);
    } else {
      playWrong();
      setStreak(0);
      setModalCorrect(false);
    }
    setTimeout(() => setModalOpen(true), 500);
  };

  if (isGameOver) {
      const stats = { score: roundScore, correct: correctAnswers, total: 5, perfectionBonus: correctAnswers === 5 ? 50 : 0 };
      return <GameSummary stats={stats} onComplete={onGameComplete} />;
  }

  if (!currentQ) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-[2rem] shadow-xl border-4 border-indigo-50 overflow-hidden">
       <div className="h-4 bg-slate-100">
        <motion.div 
            className="h-full bg-gradient-to-r from-green-400 to-red-500" 
            animate={{ width: `${(timeLeft / 12) * 100}%` }}
            transition={{ ease: "linear", duration: 1 }}
        />
       </div>
      <div className="p-6 text-center flex justify-between items-center">
        <h2 className="text-3xl font-black text-indigo-900">{gameData.title}</h2>
        <div className="text-xl font-bold">🔥 {streak}</div>
      </div>
      <div className="p-6 md:p-8 flex flex-col items-center">
        <div className="text-center mb-8 p-6 bg-indigo-100 rounded-3xl border-4 border-indigo-200 w-full">
            <p className="text-indigo-600 font-bold uppercase tracking-wider mb-2">Where is this from?</p>
            <h3 className="text-5xl font-black text-indigo-900">{currentQ.item}</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full">
          {currentQ.options.map((opt) => (
            <motion.button
              key={opt}
              onClick={() => handleSelect(opt)}
              whileTap={{ scale: 0.95 }}
              disabled={!timerActive}
              className={`p-4 rounded-2xl text-xl font-bold border-b-4 transition-all ${
                  selected === opt 
                    ? (opt === currentQ.answer ? 'bg-green-500 border-green-700 text-white' : 'bg-red-500 border-red-700 text-white')
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-indigo-50 hover:border-indigo-400'
              }`}
            >
              {opt}
            </motion.button>
          ))}
        </div>
      </div>
      {/* CONNECTED MODAL */}
      <FeedbackModal 
        isOpen={modalOpen}
        isCorrect={modalCorrect}
        onClose={handleNext}
        educationalLink={currentQ.educationalLink}
        correctMessage="IT'S A MATCH! 🎯"
        wrongMessage={timeoutHappened ? "TIME'S UP! ⏰" : "MISMATCH! ❌"}
      />
    </div>
  );
}