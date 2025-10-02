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

// --- Sound Effects ---
const correctSound = new window.Tone.Synth().toDestination();
const wrongSound = new window.Tone.Synth({ oscillator: { type: 'square' } }).toDestination();

export default function CulturalMatchUp({ onGameComplete }) {
  const { addPoints, correctlyAnsweredQIDs, markQuestionCorrect } = useGame();
  const gameData = sagaData.games.culturalMatchUp;
  
  const [gameQuestions, setGameQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(7);

  useEffect(() => {
    setGameQuestions(getSmartQuestions(gameData.questionBank, correctlyAnsweredQIDs, 5));
  }, []);

  const currentQuestion = gameQuestions[currentQuestionIndex];

  const handleNextQuestion = () => {
    const nextQuestionIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextQuestionIndex);
    setIsAnswered(false);
    setSelectedOption(null);
    setTimeLeft(7); // Reset timer
  };

  // Timer effect
  useEffect(() => {
    if (isAnswered || isGameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          wrongSound.triggerAttackRelease("C2", "8n", "+0.1");
          // Check for game over when timer runs out on the last question
          if (currentQuestionIndex === gameQuestions.length - 1) {
            setIsGameOver(true);
          } else {
            handleNextQuestion();
          }
          return 7;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentQuestionIndex, isAnswered, isGameOver]);

  const handleOptionClick = (option) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOption(option);

    const isCorrect = option === currentQuestion.answer;
    let newCorrectCount = correctAnswers;

    if (isCorrect) {
      correctSound.triggerAttackRelease("C4", "8n", "+0.1");
      markQuestionCorrect(currentQuestion.id);
      
      newCorrectCount = correctAnswers + 1;
      setCorrectAnswers(newCorrectCount);
      
      const pointsWon = 30; // Award flat 30 points
      setRoundScore(prev => prev + pointsWon);
      addPoints(pointsWon);
    } else {
      wrongSound.triggerAttackRelease("C2", "8n", "+0.1");
    }
    
    // --- THIS IS THE FIX ---
    // We now check for game over right after an answer is given, using the up-to-date count.
    if (currentQuestionIndex === gameQuestions.length - 1) {
      setIsGameOver(true);
      // If this correct answer was the 5th one, award the bonus
      if (isCorrect && newCorrectCount === 5) {
        addPoints(50);
      }
    } else {
      setTimeout(handleNextQuestion, 1500);
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

  if (!currentQuestion) return <div className="text-center p-8">Loading questions...</div>;
  
  const getButtonStyle = (option) => {
    if (!isAnswered) {
      return 'bg-slate-100 border-slate-200 hover:bg-teal-100 hover:border-teal-400';
    }
    if (option === currentQuestion.answer) {
      return 'bg-green-500 border-green-500 text-white';
    }
    if (option === selectedOption) {
      return 'bg-red-500 border-red-500 text-white';
    }
    return 'bg-slate-100 border-slate-200 opacity-50';
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 relative overflow-hidden">
       <div 
        className="absolute top-0 left-0 h-2 bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-1000 ease-linear" 
        style={{ width: `${(timeLeft / 7) * 100}%` }}
      ></div>
      <div className="p-6 text-center border-b-2 border-slate-200">
        <h2 className="text-3xl font-extrabold gradient-text">{gameData.title}</h2>
        <p className="mt-2 text-slate-600">Question {currentQuestionIndex + 1} of 5</p>
      </div>
      <div className="p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-6"
          >
            <p className="text-lg text-slate-600">Match this item:</p>
            <h3 className="text-4xl font-bold text-slate-800 mt-2">{currentQuestion.item}</h3>
          </motion.div>
        </AnimatePresence>
        <div className="grid grid-cols-2 gap-4">
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

