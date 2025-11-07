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
const playClick = () => safePlaySound('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');

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

export default function ArtisansEye({ onGameComplete }) {
  const { addPoints, markQuestionCorrect, correctlyAnsweredQIDs, spendPoints } = useGame();
  const gameData = sagaData.games.artisansEye;
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hintShown, setHintShown] = useState(false);

  // --- MODAL STATE ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCorrect, setModalCorrect] = useState(false);

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
      setHintShown(false);
    } else {
      setIsGameOver(true);
      if (correctAnswers === 5) addPoints(50);
    }
  };

  const handleSelect = (option) => {
    if (selected) return;
    setSelected(option);
    if (option === currentQ.answer) {
      playCorrect();
      markQuestionCorrect(currentQ.id);
      setCorrectAnswers(prev => prev + 1);
      addPoints(30);
      setRoundScore(prev => prev + 30);
      setModalCorrect(true);
    } else {
      playWrong();
      setModalCorrect(false);
    }
    setTimeout(() => setModalOpen(true), 500);
  };

  const handleHint = () => {
      if (!hintShown && spendPoints(15)) {
          playClick();
          setHintShown(true);
      }
  };

  if (isGameOver) {
    const stats = { score: roundScore, correct: correctAnswers, total: 5, perfectionBonus: correctAnswers === 5 ? 50 : 0 };
    return <GameSummary stats={stats} onComplete={onGameComplete} />;
  }

  if (!currentQ) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-[2rem] shadow-xl border-4 border-slate-100 overflow-hidden">
      <div className="p-6 text-center bg-slate-50 border-b-2 border-slate-200">
        <h2 className="text-3xl font-black gradient-text">{gameData.title}</h2>
        <p className="text-slate-500 font-bold">Question {currentIndex + 1} / 5</p>
      </div>
      <div className="p-6 md:p-8">
        <div className="text-center mb-8">
            <div className="relative w-full aspect-video bg-slate-800 rounded-2xl overflow-hidden shadow-inner border-2 border-slate-300">
                <img src={currentQ.imageUrl} alt="Detail" className="w-full h-full object-cover" />
                <AnimatePresence>
                    {hintShown && (
                        <motion.div initial={{y: 50, opacity: 0}} animate={{y: 0, opacity: 1}} className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-4 backdrop-blur-md">
                            <p className="font-semibold italic">💡 {currentQ.detail}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {!hintShown && (
                <button onClick={handleHint} className="mt-4 px-6 py-2 text-sm font-bold text-teal-700 bg-teal-100 rounded-full hover:bg-teal-200 transition hover:scale-105">
                    🔍 Reveal Hint (-15 QP)
                </button>
            )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQ.options.map((opt) => (
            <motion.button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={!!selected}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-xl text-lg font-bold transition-all border-4 ${
                selected === opt 
                    ? (opt === currentQ.answer ? 'bg-green-500 border-green-600 text-white' : 'bg-red-500 border-red-600 text-white')
                    : 'bg-slate-100 border-slate-200 hover:bg-white hover:border-teal-400 text-slate-700'
              } ${selected && selected !== opt ? 'opacity-40' : ''}`}
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
        correctMessage="Eagle Eye! 🦅"
        wrongMessage="Not quite that one!"
      />
    </div>
  );
}