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
const clickSound = new window.Tone.MembraneSynth().toDestination();

export default function ArtisansEye({ onGameComplete }) {
  const { addPoints, correctlyAnsweredQIDs, markQuestionCorrect, spendPoints } = useGame();
  const gameData = sagaData.games.artisansEye;
  
  const [gameQuestions, setGameQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hintShown, setHintShown] = useState(false); // State for the hint
  const [hintMessage, setHintMessage] = useState(''); // State for hint feedback

  useEffect(() => {
    setGameQuestions(getSmartQuestions(gameData.questionBank, correctlyAnsweredQIDs, 5));
  }, []);

  const currentQuestion = gameQuestions[currentQuestionIndex];

  const handleNextQuestion = () => {
    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < gameQuestions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
      setIsAnswered(false);
      setSelectedOption(null);
      setHintShown(false); // Reset hint for the next question
      setHintMessage('');
    } else {
      setIsGameOver(true);
      if (correctAnswers === 5) {
        addPoints(50);
      }
    }
  };

  const handleOptionClick = (option) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOption(option);

    if (option === currentQuestion.answer) {
      correctSound.triggerAttackRelease("C4", "8n");
      markQuestionCorrect(currentQuestion.id);
      setCorrectAnswers(prev => prev + 1);
      const pointsWon = 30;
      setRoundScore(prev => prev + pointsWon);
      addPoints(pointsWon);
    } else {
      wrongSound.triggerAttackRelease("C2", "8n");
    }
    
    setTimeout(handleNextQuestion, 2000);
  };
  
  const handleShowDetail = () => {
    clickSound.triggerAttackRelease("C1", "8n");
    if (hintShown) return;

    if (spendPoints(15)) {
        setHintShown(true);
    } else {
        setHintMessage("Not enough QP for a hint!");
        setTimeout(() => setHintMessage(''), 2000);
    }
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

  if (!currentQuestion) return <div className="text-center p-8">Loading monuments...</div>;

  const getButtonStyle = (option) => {
    if (!isAnswered) return 'bg-slate-100 border-slate-200 hover:bg-teal-100 hover:border-teal-400';
    if (option === currentQuestion.answer) return 'bg-green-500 border-green-500 text-white';
    if (option === selectedOption) return 'bg-red-500 border-red-500 text-white';
    return 'bg-slate-100 border-slate-200 opacity-60';
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200">
      <div className="p-6 text-center border-b-2 border-slate-200">
        <h2 className="text-3xl font-extrabold gradient-text">{gameData.title}</h2>
        <p className="mt-1 text-slate-600">Question {currentQuestionIndex + 1} of 5</p>
      </div>
      <div className="p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQuestionIndex}
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center mb-6"
          >
            <div className="w-full aspect-video bg-slate-800 rounded-lg overflow-hidden shadow-inner">
                <img 
                    src={currentQuestion.imageUrl} 
                    alt="Monument detail"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/600x400/232F3E/FFFFFF?text=Image+Not+Found`; }}
                />
            </div>
            
            {/* Hint Button and Display */}
            {!hintShown ? (
                <button 
                    onClick={handleShowDetail}
                    className="mt-4 px-6 py-2 text-sm font-semibold text-teal-700 bg-teal-100 rounded-full hover:bg-teal-200 transition"
                >
                    Show Detail (-15 QP)
                </button>
            ) : (
                <p className="text-lg text-slate-600 italic mt-4 h-10 flex items-center justify-center">{currentQuestion.detail}</p>
            )}
            {hintMessage && <p className="text-sm text-red-500 font-semibold mt-2">{hintMessage}</p>}

          </motion.div>
        </AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {currentQuestion.options.map((option) => (
            <motion.button
              key={option}
              onClick={() => handleOptionClick(option)}
              disabled={isAnswered}
              whileTap={{ scale: 0.95 }}
              className={`p-4 rounded-lg text-lg font-semibold text-center transition-all duration-300 border-2 ${getButtonStyle(option)}`}
            >
              {option}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

